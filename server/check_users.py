"""
Check if users were created in MongoDB
"""
import asyncio
from dotenv import load_dotenv
load_dotenv()
from database import db

async def check_users():
    print("Connecting to MongoDB...")
    await db.connect_db()
    
    if db.get_db() is None:
        print("❌ Failed to connect to database")
        return
    
    print("✅ Connected to MongoDB\n")
    
    database = db.get_db()
    users_collection = database.users
    
    # Get all users
    users = await users_collection.find().to_list(100)
    
    print(f"Total users in database: {len(users)}\n")
    
    if users:
        print("Users:")
        print("-" * 80)
        for user in users:
            print(f"  ID: {user.get('_id')}")
            print(f"  Email: {user.get('email')}")
            print(f"  Username: {user.get('username')}")
            print(f"  Full Name: {user.get('full_name')}")
            print(f"  Role: {user.get('role')}")
            print(f"  Store Credits: {user.get('store_credits')}")
            print(f"  Created: {user.get('created_at')}")
            print("-" * 80)
    else:
        print("No users found in database")
    
    await db.close_db()

if __name__ == '__main__':
    asyncio.run(check_users())
