import asyncio
from datetime import datetime
import json
from decimal import Decimal
from sqlalchemy.future import select
from firebase_db import get_firestore_client
from database import AsyncSessionLocal, engine
import models

# Mapping from Firestore ID (string) to Postgres ID (int)
users_map = {}
products_map = {}
conversations_map = {}
orders_map = {}
offers_map = {}

def parse_date(date_val):
    if not date_val:
        return datetime.utcnow()
    if isinstance(date_val, datetime):
        return date_val
    try:
        # Check if it has a Z or needs to be parsed
        if isinstance(date_val, str):
            # Strip timezone info if any or replace Z
            if date_val.endswith("Z"):
                date_val = date_val[:-1]
            return datetime.fromisoformat(date_val)
    except Exception:
        pass
    return datetime.utcnow()

async def migrate():
    db = get_firestore_client()
    async with AsyncSessionLocal() as session:
        # ----------------------------------------
        # 1. Migrate Users
        # ----------------------------------------
        print("Fetching users from Firestore...")
        user_docs = list(db.collection('users').stream())
        print(f"Found {len(user_docs)} users.")
        for doc in user_docs:
            u = doc.to_dict()
            fid = doc.id
            created_at = parse_date(u.get('created_at'))
            
            # Check if user with same email exists in PG to avoid duplicate key error
            result = await session.execute(select(models.User).where(models.User.email == u.get('email')))
            existing_user = result.scalars().first()
            if existing_user:
                print(f"User with email {u.get('email')} already exists in Postgres.")
                users_map[fid] = existing_user.id
                continue
                
            pg_user = models.User(
                email=u.get('email'),
                hashed_password=u.get('hashed_password') or u.get('password', 'default_hash'),
                full_name=u.get('full_name'),
                phone=u.get('phone'),
                avatar_url=u.get('avatar_url'),
                is_admin=bool(u.get('is_admin', False)),
                is_active=bool(u.get('is_active', True)),
                created_at=created_at
            )
            session.add(pg_user)
            await session.flush()  # to generate pg_user.id
            users_map[fid] = pg_user.id
        
        # ----------------------------------------
        # 2. Migrate Products
        # ----------------------------------------
        print("\nFetching products from Firestore...")
        product_docs = list(db.collection('products').stream())
        print(f"Found {len(product_docs)} products.")
        for doc in product_docs:
            p = doc.to_dict()
            fid = doc.id
            created_at = parse_date(p.get('created_at'))
            
            # check if name/sku/id is duplicate to be safe
            result = await session.execute(select(models.Product).where(models.Product.name == p.get('name')))
            existing_prod = result.scalars().first()
            if existing_prod:
                print(f"Product with name {p.get('name')} already exists in Postgres.")
                products_map[fid] = existing_prod.id
                continue

            pg_product = models.Product(
                name=p.get('name'),
                description=p.get('description'),
                price=float(p.get('price', 0.0)),
                category=p.get('category'),
                brand=p.get('brand'),
                condition=p.get('condition'),
                stock=int(p.get('stock', 0)),
                image_url=p.get('image_url'),
                images=p.get('images', []),
                is_featured=bool(p.get('is_featured', False)),
                rating=float(p.get('rating', 0.0)),
                review_count=int(p.get('review_count', 0)),
                created_at=created_at
            )
            session.add(pg_product)
            await session.flush()
            products_map[fid] = pg_product.id

        # ----------------------------------------
        # 3. Migrate Testimonials
        # ----------------------------------------
        print("\nFetching testimonials from Firestore...")
        test_docs = list(db.collection('testimonials').stream())
        print(f"Found {len(test_docs)} testimonials.")
        for doc in test_docs:
            t = doc.to_dict()
            pg_testimonial = models.Testimonial(
                customer_name=t.get('customer_name') or t.get('name', 'Anonymous'),
                content=t.get('content') or t.get('text', ''),
                rating=int(t.get('rating', 5)),
                is_verified=bool(t.get('is_verified', False)),
                created_at=parse_date(t.get('created_at'))
            )
            session.add(pg_testimonial)

        # ----------------------------------------
        # 4. Migrate Content Items
        # ----------------------------------------
        print("\nFetching content items from Firestore...")
        content_docs = list(db.collection('content').stream())
        print(f"Found {len(content_docs)} content items.")
        for doc in content_docs:
            c = doc.to_dict()
            pg_content = models.ContentItem(
                title=c.get('title', 'No Title'),
                description=c.get('description'),
                category=c.get('category'),
                type=c.get('type'),
                status=c.get('status', 'Live'),
                image_url=c.get('image_url'),
                external_link=c.get('external_link'),
                order=int(c.get('order', 0)),
                date=c.get('date'),
                created_at=parse_date(c.get('created_at'))
            )
            session.add(pg_content)

        # ----------------------------------------
        # 5. Migrate Addresses
        # ----------------------------------------
        print("\nFetching addresses from Firestore...")
        addr_docs = list(db.collection('addresses').stream())
        print(f"Found {len(addr_docs)} addresses.")
        for doc in addr_docs:
            a = doc.to_dict()
            fid_user = a.get('user_id')
            if fid_user not in users_map:
                continue
            pg_addr = models.UserAddress(
                user_id=users_map[fid_user],
                label=a.get('label', 'Home'),
                full_name=a.get('full_name') or a.get('name', 'Unknown'),
                phone=a.get('phone', '000'),
                address_line=a.get('address') or a.get('address_line', ''),
                city=a.get('city', 'Nairobi'),
                county=a.get('county'),
                is_default=bool(a.get('is_default', False)),
                created_at=parse_date(a.get('created_at'))
            )
            session.add(pg_addr)

        # ----------------------------------------
        # 6. Migrate Cart Items
        # ----------------------------------------
        print("\nFetching cart items from Firestore...")
        cart_docs = list(db.collection('cart_items').stream())
        print(f"Found {len(cart_docs)} cart items.")
        for doc in cart_docs:
            c = doc.to_dict()
            fid_user = c.get('user_id')
            fid_prod = c.get('product_id')
            if fid_user not in users_map or fid_prod not in products_map:
                continue
            pg_cart = models.CartItem(
                user_id=users_map[fid_user],
                product_id=products_map[fid_prod],
                quantity=int(c.get('quantity', 1)),
                created_at=parse_date(c.get('created_at'))
            )
            session.add(pg_cart)

        # ----------------------------------------
        # 7. Migrate Wishlist Items
        # ----------------------------------------
        print("\nFetching wishlist items from Firestore...")
        wish_docs = list(db.collection('wishlist').stream())
        print(f"Found {len(wish_docs)} wishlist items.")
        for doc in wish_docs:
            w = doc.to_dict()
            fid_user = w.get('user_id')
            fid_prod = w.get('product_id')
            if fid_user not in users_map or fid_prod not in products_map:
                continue
            pg_wish = models.WishlistItem(
                user_id=users_map[fid_user],
                product_id=products_map[fid_prod],
                created_at=parse_date(w.get('created_at'))
            )
            session.add(pg_wish)

        # ----------------------------------------
        # 8. Migrate Conversations
        # ----------------------------------------
        print("\nFetching conversations from Firestore...")
        conv_docs = list(db.collection('conversations').stream())
        print(f"Found {len(conv_docs)} conversations.")
        for doc in conv_docs:
            c = doc.to_dict()
            fid_user = c.get('user_id')
            if fid_user not in users_map:
                continue
            pg_conv = models.Conversation(
                customer_id=users_map[fid_user],
                subject=c.get('subject', 'General Inquiry'),
                status=c.get('status', 'open'),
                created_at=parse_date(c.get('created_at'))
            )
            session.add(pg_conv)
            await session.flush()
            conversations_map[doc.id] = pg_conv.id

        # ----------------------------------------
        # 9. Migrate Messages
        # ----------------------------------------
        print("\nFetching messages from Firestore...")
        msg_docs = list(db.collection('messages').stream())
        print(f"Found {len(msg_docs)} messages.")
        for doc in msg_docs:
            m = doc.to_dict()
            fid_conv = m.get('conversation_id')
            fid_sender = m.get('sender_id')
            if fid_conv not in conversations_map or fid_sender not in users_map:
                continue
            pg_msg = models.Message(
                conversation_id=conversations_map[fid_conv],
                sender_id=users_map[fid_sender],
                content=m.get('content', ''),
                is_read=bool(m.get('is_read', False)),
                created_at=parse_date(m.get('created_at'))
            )
            session.add(pg_msg)

        # ----------------------------------------
        # 10. Migrate Offers
        # ----------------------------------------
        print("\nFetching offers from Firestore...")
        offer_docs = list(db.collection('offers').stream())
        print(f"Found {len(offer_docs)} offers.")
        for doc in offer_docs:
            o = doc.to_dict()
            pg_offer = models.Offer(
                title=o.get('title', 'Special Offer'),
                description=o.get('description'),
                discount_percentage=int(o.get('discount_percentage') or o.get('discount_percent') or o.get('discount', 10)),
                banner_color=o.get('banner_color', '#EF4444'),
                badge_text=o.get('badge_text', 'SALE'),
                start_date=parse_date(o.get('start_date')),
                end_date=parse_date(o.get('end_date')),
                is_active=bool(o.get('is_active', True)),
                created_at=parse_date(o.get('created_at'))
            )
            session.add(pg_offer)
            await session.flush()
            offers_map[doc.id] = pg_offer.id

        # ----------------------------------------
        # 11. Migrate Orders
        # ----------------------------------------
        print("\nFetching orders from Firestore...")
        order_docs = list(db.collection('orders').stream())
        print(f"Found {len(order_docs)} orders.")
        for doc in order_docs:
            o = doc.to_dict()
            fid_user = o.get('user_id')
            if fid_user not in users_map:
                continue
            pg_order = models.Order(
                user_id=users_map[fid_user],
                status=o.get('status', 'pending'),
                total_amount=float(o.get('total_amount', 0.0)),
                tracking_id=o.get('tracking_id'),
                payment_method=o.get('payment_method'),
                payment_status=o.get('payment_status', 'pending'),
                payment_reference=o.get('payment_reference'),
                customer_name=o.get('customer_name'),
                customer_email=o.get('customer_email'),
                customer_phone=o.get('customer_phone'),
                delivery_address=o.get('delivery_address'),
                notes=o.get('notes'),
                approved_at=parse_date(o.get('approved_at')) if o.get('approved_at') else None,
                approved_by=users_map.get(o.get('approved_by')) if o.get('approved_by') else None,
                shipped_at=parse_date(o.get('shipped_at')) if o.get('shipped_at') else None,
                delivered_at=parse_date(o.get('delivered_at')) if o.get('delivered_at') else None,
                created_at=parse_date(o.get('created_at'))
            )
            session.add(pg_order)
            await session.flush()
            orders_map[doc.id] = pg_order.id

        # ----------------------------------------
        # 12. Migrate Reviews
        # ----------------------------------------
        print("\nFetching reviews from Firestore...")
        review_docs = list(db.collection('reviews').stream())
        print(f"Found {len(review_docs)} reviews.")
        for doc in review_docs:
            r = doc.to_dict()
            fid_prod = r.get('product_id')
            fid_user = r.get('user_id')
            fid_order = r.get('order_id')
            if fid_prod not in products_map or fid_user not in users_map:
                continue
            pg_review = models.Review(
                product_id=products_map[fid_prod],
                user_id=users_map[fid_user],
                order_id=orders_map.get(fid_order) if fid_order else None,
                rating=int(r.get('rating', 5)),
                title=r.get('title'),
                comment=r.get('comment'),
                is_approved=bool(r.get('is_approved', False)),
                is_verified_purchase=bool(r.get('is_verified_purchase', False)),
                helpful_votes=int(r.get('helpful_votes', 0)),
                created_at=parse_date(r.get('created_at'))
            )
            session.add(pg_review)

        # Commit everything to the database
        await session.commit()
        print("\nMigration complete: Successfully committed all data to Neon Postgres!")

if __name__ == "__main__":
    asyncio.run(migrate())
