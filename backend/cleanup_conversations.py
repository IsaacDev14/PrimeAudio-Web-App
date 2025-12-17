
import asyncio
import database
import models
from sqlalchemy import select, delete, and_

async def cleanup_empty_conversations():
    async for db in database.get_db():
        print("Scanning for empty conversations...")
        
        # database.get_db yields a session, so we use it directly
        # First, find conversations with 0 messages
        result = await db.execute(select(models.Conversation))
        conversations = result.scalars().all()
        
        count = 0
        for conv in conversations:
            # Check message count
            msg_result = await db.execute(
                select(models.Message).where(models.Message.conversation_id == conv.id)
            )
            messages = msg_result.scalars().all()
            
            if len(messages) == 0:
                print(f"Deleting empty conversation {conv.id}: {conv.subject}")
                await db.execute(
                    delete(models.Conversation).where(models.Conversation.id == conv.id)
                )
                count += 1
        
        await db.commit()
        print(f"Cleanup complete. Deleted {count} empty conversations.")
        break

if __name__ == "__main__":
    asyncio.run(cleanup_empty_conversations())
