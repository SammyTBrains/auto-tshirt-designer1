import asyncio
import os
from dotenv import load_dotenv
load_dotenv()
from db_models import UserCreate
from crud import create_user, get_user_by_email
from database import db

async def run():
    # Connect to database first!
    print("Connecting to MongoDB...")
    await db.connect_db()
    
    if db.get_db() is None:
        print("❌ Failed to connect to database. Check your MONGODB_URL in .env")
        return
    
    print("✅ Connected to MongoDB")
    
    # Create test user
    test_user = UserCreate(
        email="testuser@example.com",
        username="testuser",
        full_name="Test User",
        password="TestPass123"
    )
    
    print(f"\nCreating user: {test_user.email}")
    user = await create_user(test_user)
    
    if user:
        print(f"✅ User created successfully!")
        print(f"   ID: {user.id}")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Store Credits: {user.store_credits}")
        
        # Fetch user to verify
        print(f"\nFetching user from database...")
        fetched = await get_user_by_email(test_user.email)
        if fetched:
            print(f"✅ User fetch successful!")
            print(f"   Fetched user: {fetched.username}")
        else:
            print(f"❌ Could not fetch user after creation")
    else:
        print(f"❌ Failed to create user")
    
    # Clean up
    await db.close_db()

if __name__ == '__main__':
    asyncio.run(run())
