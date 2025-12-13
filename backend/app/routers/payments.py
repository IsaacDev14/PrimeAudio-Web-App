from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from database import get_db
from models import Order, Notification, generate_tracking_id
from app.routers.auth import get_current_user
from app.services.mpesa import mpesa_service
from app.services.paystack import paystack_service
from app.services.notifications import email_service, sms_service

router = APIRouter(prefix="/payments", tags=["Payments"])


class MpesaPaymentRequest(BaseModel):
    order_id: int
    phone: str


class CardPaymentRequest(BaseModel):
    order_id: int
    email: str
    callback_url: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    order_id: int
    reference: str  # checkout_request_id for M-Pesa, reference for Paystack


class BankTransferInfo(BaseModel):
    order_id: int


@router.post("/mpesa/initiate")
async def initiate_mpesa_payment(
    request: MpesaPaymentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Initiate M-Pesa STK Push payment"""
    try:
        order = db.query(Order).filter(Order.id == request.order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if order.payment_status == "paid":
            raise HTTPException(status_code=400, detail="Order already paid")
        
        # Initiate STK Push
        result = await mpesa_service.stk_push(
            phone=request.phone,
            amount=order.total_amount,
            order_id=order.id,
            description=f"Prime Audio Order #{order.id}"
        )
        
        if result.get("success"):
            # Store payment reference
            order.payment_method = "mpesa"
            order.payment_reference = result.get("checkout_request_id")
            order.customer_phone = request.phone
            db.commit()
            
            return {
                "success": True,
                "message": "STK Push sent. Please enter your M-Pesa PIN.",
                "checkout_request_id": result.get("checkout_request_id")
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "Failed to initiate payment")
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"M-Pesa initiate error: {e}")
        import traceback
        traceback.print_exc()
        # Return error as response instead of 500
        return {
            "success": False,
            "error": f"Payment service error: {str(e)}"
        }


@router.post("/mpesa/verify")
async def verify_mpesa_payment(
    request: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Verify M-Pesa payment status"""
    order = db.query(Order).filter(Order.id == request.order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await mpesa_service.verify_payment(request.reference)
    
    if result.get("success") and result.get("paid"):
        # Update order status
        order.payment_status = "paid"
        if not order.tracking_id:
            order.tracking_id = generate_tracking_id()
        db.commit()
        
        # Send notifications
        if order.customer_email:
            email_service.send_order_confirmation(
                order.customer_email, 
                order.id, 
                order.tracking_id, 
                order.total_amount
            )
        if order.customer_phone:
            sms_service.send_order_confirmation(
                order.customer_phone, 
                order.tracking_id, 
                order.total_amount
            )
        
        # Create in-app notification
        notification = Notification(
            user_id=order.user_id,
            title="Payment Successful",
            message=f"Your payment for order #{order.id} has been received. Tracking ID: {order.tracking_id}",
            type="order_update",
            link=f"/dashboard/orders/{order.id}"
        )
        db.add(notification)
        db.commit()
        
        return {
            "success": True,
            "paid": True,
            "tracking_id": order.tracking_id,
            "message": "Payment confirmed"
        }
    else:
        return {
            "success": True,
            "paid": False,
            "message": result.get("message", "Payment not completed")
        }


@router.post("/mpesa/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    """M-Pesa callback endpoint (called by Safaricom)"""
    try:
        data = await request.json()
        
        # Parse callback data
        body = data.get("Body", {}).get("stkCallback", {})
        result_code = body.get("ResultCode")
        checkout_request_id = body.get("CheckoutRequestID")
        
        # Find order by checkout request ID
        order = db.query(Order).filter(
            Order.payment_reference == checkout_request_id
        ).first()
        
        if order and result_code == 0:
            order.payment_status = "paid"
            if not order.tracking_id:
                order.tracking_id = generate_tracking_id()
            db.commit()
            
            # Send notifications
            if order.customer_email:
                email_service.send_order_confirmation(
                    order.customer_email, 
                    order.id, 
                    order.tracking_id, 
                    order.total_amount
                )
        
        return {"ResultCode": 0, "ResultDesc": "Success"}
    except Exception as e:
        print(f"M-Pesa callback error: {e}")
        return {"ResultCode": 1, "ResultDesc": "Error"}


@router.post("/card/initiate")
async def initiate_card_payment(
    request: CardPaymentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Initialize card payment via Paystack"""
    order = db.query(Order).filter(Order.id == request.order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if order.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")
    
    # Generate unique reference
    reference = f"PA-{order.id}-{uuid.uuid4().hex[:8].upper()}"
    
    result = await paystack_service.initialize_transaction(
        email=request.email,
        amount=order.total_amount,
        reference=reference,
        callback_url=request.callback_url,
        metadata={"order_id": order.id}
    )
    
    if result.get("success"):
        order.payment_method = "card"
        order.payment_reference = reference
        order.customer_email = request.email
        db.commit()
        
        return {
            "success": True,
            "authorization_url": result.get("authorization_url"),
            "reference": reference
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "Failed to initialize payment")
        }


@router.post("/card/verify")
async def verify_card_payment(
    request: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Verify card payment status"""
    order = db.query(Order).filter(Order.id == request.order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await paystack_service.verify_transaction(request.reference)
    
    if result.get("success") and result.get("paid"):
        order.payment_status = "paid"
        if not order.tracking_id:
            order.tracking_id = generate_tracking_id()
        db.commit()
        
        # Send notifications
        if order.customer_email:
            email_service.send_order_confirmation(
                order.customer_email, 
                order.id, 
                order.tracking_id, 
                order.total_amount
            )
        
        # Create in-app notification
        notification = Notification(
            user_id=order.user_id,
            title="Payment Successful",
            message=f"Your payment for order #{order.id} has been received.",
            type="order_update",
            link=f"/dashboard/orders/{order.id}"
        )
        db.add(notification)
        db.commit()
        
        return {
            "success": True,
            "paid": True,
            "tracking_id": order.tracking_id
        }
    else:
        return {
            "success": True,
            "paid": False,
            "message": result.get("message", "Payment not completed")
        }


@router.get("/card/public-key")
async def get_paystack_public_key():
    """Get Paystack public key for frontend"""
    return {"public_key": paystack_service.get_public_key()}


@router.post("/bank-transfer/info")
async def get_bank_transfer_info(
    request: BankTransferInfo,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get bank transfer information for manual payment"""
    order = db.query(Order).filter(Order.id == request.order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update payment method
    order.payment_method = "bank_transfer"
    if not order.tracking_id:
        order.tracking_id = generate_tracking_id()
    db.commit()
    
    return {
        "success": True,
        "tracking_id": order.tracking_id,
        "bank_details": {
            "bank_name": "Equity Bank",
            "account_name": "Prime Audio Solutions Ltd",
            "account_number": "0123456789012",
            "branch": "Westlands, Nairobi",
            "swift_code": "EABORKE"
        },
        "reference": f"ORDER-{order.tracking_id}",
        "amount": order.total_amount,
        "instructions": "Please use the reference code when making your transfer. Your order will be processed once payment is confirmed."
    }
