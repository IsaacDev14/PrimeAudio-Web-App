from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, select
from sqlalchemy.sql import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json

import database
import models
from app.routers.auth import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])


# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_message(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)


manager = ConnectionManager()


# Pydantic Models
class ConversationCreate(BaseModel):
    subject: str = "General Inquiry"


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str
    sender_is_admin: bool
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    customer_email: str
    subject: str
    status: str
    last_message: Optional[str]
    unread_count: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# REST API endpoints
@router.get("/conversations")
async def get_conversations(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all conversations for current user (admins see all, customers see their own)"""
    try:
        if current_user.is_admin:
            result = await db.execute(
                select(models.Conversation).order_by(desc(models.Conversation.created_at))
            )
        else:
            result = await db.execute(
                select(models.Conversation).where(
                    models.Conversation.customer_id == current_user.id
                ).order_by(desc(models.Conversation.created_at))
            )
        
        conversations = result.scalars().all()
        response = []
        
        for conv in conversations:
            # Get customer info
            customer_result = await db.execute(
                select(models.User).where(models.User.id == conv.customer_id)
            )
            customer = customer_result.scalars().first()
            
            # Get last message
            last_msg_result = await db.execute(
                select(models.Message).where(
                    models.Message.conversation_id == conv.id
                ).order_by(desc(models.Message.created_at)).limit(1)
            )
            last_msg = last_msg_result.scalars().first()
            
            # Count unread
            unread_result = await db.execute(
                select(models.Message).where(
                    and_(
                        models.Message.conversation_id == conv.id,
                        models.Message.sender_id != current_user.id,
                        models.Message.is_read == False
                    )
                )
            )
            unread_items = unread_result.scalars().all()
            
            response.append({
                "id": conv.id,
                "customer_id": conv.customer_id,
                "customer_name": customer.full_name or customer.email if customer else "Unknown",
                "customer_email": customer.email if customer else "",
                "subject": conv.subject,
                "status": conv.status,
                "last_message": last_msg.content[:100] if last_msg else None,
                "unread_count": len(unread_items),
                "created_at": conv.created_at.isoformat() if conv.created_at else None,
                "updated_at": conv.updated_at.isoformat() if conv.updated_at else None
            })
        
        return response
    except Exception as e:
        print(f"Error fetching conversations: {e}")
        return []


@router.post("/conversations")
async def create_conversation(
    data: ConversationCreate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new conversation (customers only)"""
    if current_user.is_admin:
        raise HTTPException(status_code=400, detail="Admins cannot start conversations")
    
    conversation = models.Conversation(
        customer_id=current_user.id,
        subject=data.subject
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    
    # Notify admins
    admin_result = await db.execute(
        select(models.User).where(models.User.is_admin == True)
    )
    admins = admin_result.scalars().all()
    
    for admin in admins:
        notification = models.Notification(
            user_id=admin.id,
            title="New Message",
            message=f"New conversation from {current_user.full_name or current_user.email}: {data.subject}",
            type="message",
            link=f"/admin/messages/{conversation.id}"
        )
        db.add(notification)
    await db.commit()
    
    return {"id": conversation.id, "message": "Conversation created"}


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all messages in a conversation"""
    result = await db.execute(
        select(models.Conversation).where(models.Conversation.id == conversation_id)
    )
    conversation = result.scalars().first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check access
    if not current_user.is_admin and conversation.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get messages
    msg_result = await db.execute(
        select(models.Message).where(
            models.Message.conversation_id == conversation_id
        ).order_by(models.Message.created_at)
    )
    messages = msg_result.scalars().all()
    
    response = []
    for msg in messages:
        sender_result = await db.execute(
            select(models.User).where(models.User.id == msg.sender_id)
        )
        sender = sender_result.scalars().first()
        
        # Mark as read
        if msg.sender_id != current_user.id and not msg.is_read:
            msg.is_read = True
        
        response.append({
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "sender_id": msg.sender_id,
            "sender_name": sender.full_name or sender.email if sender else "Unknown",
            "sender_is_admin": sender.is_admin if sender else False,
            "content": msg.content,
            "is_read": msg.is_read,
            "created_at": msg.created_at.isoformat() if msg.created_at else None
        })
    
    await db.commit()
    return response


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: int,
    data: MessageCreate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Send a message in a conversation"""
    result = await db.execute(
        select(models.Conversation).where(models.Conversation.id == conversation_id)
    )
    conversation = result.scalars().first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check access
    if not current_user.is_admin and conversation.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    message = models.Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=data.content
    )
    db.add(message)
    
    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(message)
    
    return {"id": message.id, "message": "Message sent"}


@router.put("/conversations/{conversation_id}/close")
async def close_conversation(
    conversation_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Close a conversation (admins only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(models.Conversation).where(models.Conversation.id == conversation_id)
    )
    conversation = result.scalars().first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.status = "closed"
    await db.commit()
    
    return {"message": "Conversation closed"}


@router.get("/unread-count")
async def get_unread_message_count(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get total unread message count"""
    try:
        if current_user.is_admin:
            result = await db.execute(
                select(models.Conversation)
            )
        else:
            result = await db.execute(
                select(models.Conversation).where(
                    models.Conversation.customer_id == current_user.id
                )
            )
        
        conversations = result.scalars().all()
        total = 0
        
        for conv in conversations:
            unread_result = await db.execute(
                select(models.Message).where(
                    and_(
                        models.Message.conversation_id == conv.id,
                        models.Message.sender_id != current_user.id,
                        models.Message.is_read == False
                    )
                )
            )
            total += len(unread_result.scalars().all())
        
        return {"count": total}
    except Exception as e:
        print(f"Error counting unread: {e}")
        return {"count": 0}


# WebSocket endpoint for real-time messaging
@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket connection for real-time messaging"""
    from app.routers.auth import verify_token
    
    try:
        # Verify token to get user
        payload = verify_token(token)
        if not payload:
            await websocket.close(code=4001)
            return
        
        user_id = payload.get("user_id")
        if not user_id:
            await websocket.close(code=4001)
            return
        
        await manager.connect(websocket, user_id)
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_json()
                
                # Handle different message types
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                    
                elif data.get("type") == "message":
                    conversation_id = data.get("conversation_id")
                    content = data.get("content")
                    
                    if conversation_id and content:
                        # Save message to database
                        async for db in database.get_db():
                            # Get conversation
                            result = await db.execute(
                                select(models.Conversation).where(
                                    models.Conversation.id == conversation_id
                                )
                            )
                            conv = result.scalars().first()
                            
                            if conv:
                                message = models.Message(
                                    conversation_id=conversation_id,
                                    sender_id=user_id,
                                    content=content
                                )
                                db.add(message)
                                
                                conv.last_message = content
                                conv.updated_at = datetime.utcnow()
                                
                                await db.commit()
                                await db.refresh(message)
                                
                                # Get sender info
                                sender_result = await db.execute(
                                    select(models.User).where(models.User.id == user_id)
                                )
                                sender = sender_result.scalars().first()
                                
                                # Prepare response
                                msg_data = {
                                    "type": "new_message",
                                    "message": {
                                        "id": message.id,
                                        "conversation_id": conversation_id,
                                        "sender_id": user_id,
                                        "sender_name": sender.full_name or sender.email if sender else "Unknown",
                                        "sender_is_admin": sender.is_admin if sender else False,
                                        "content": content,
                                        "created_at": message.created_at.isoformat() if message.created_at else None
                                    }
                                }
                                
                                # Send to sender
                                await manager.send_message(user_id, msg_data)
                                
                                # Send to other party (customer or admin)
                                target_id = conv.customer_id
                                if user_id == conv.customer_id:
                                    # Find an admin to notify (in real app, would have assigned_admin_id)
                                    admin_result = await db.execute(
                                        select(models.User).where(models.User.is_admin == True)
                                    )
                                    admins = admin_result.scalars().all()
                                    for admin in admins:
                                        await manager.send_message(admin.id, msg_data)
                                else:
                                    await manager.send_message(target_id, msg_data)
                                
                            break
                
        except WebSocketDisconnect:
            manager.disconnect(user_id)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=4000)
