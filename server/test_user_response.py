"""
Test UserResponse serialization
"""
import asyncio
from dotenv import load_dotenv
load_dotenv()
from database import db
from crud import get_user_by_email
from db_models import UserResponse

async def test_response():
    print("Connecting to MongoDB...")
    await db.connect_db()
    
    if db.get_db() is None:
        print("❌ Failed to connect")
        return
    
    print("✅ Connected\n")
    
    # Get a user
    user = await get_user_by_email("testuser@example.com")
    if not user:
        print("❌ User not found")
        return
    
    print(f"User object: {user}")
    print(f"User ID: {user.id}")
    print(f"User email: {user.email}\n")
    
    # Try to create UserResponse
    try:
        response = UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            role=user.role,
            store_credits=user.store_credits,
            is_active=user.is_active,
            created_at=user.created_at
        )
        print("✅ UserResponse created successfully!")
        print(f"Response: {response}")
        print(f"\nJSON dump: {response.model_dump_json()}")
    except Exception as e:
        print(f"❌ Error creating UserResponse: {e}")
        import traceback
        traceback.print_exc()
    
    await db.close_db()

if __name__ == '__main__':
    asyncio.run(test_response())
