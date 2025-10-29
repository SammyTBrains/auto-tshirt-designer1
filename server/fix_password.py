"""
Quick script to update user password with faster bcrypt hash
"""
import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add parent dir to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load env
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

from server.database import db
from server.auth import get_password_hash

async def fix_password():
    """Update the user's password hash"""
    await db.connect_db()
    database = db.get_db()
    
    email = "temitopeorido02@gmail.com"
    new_password = "Mountaintop22"
    
    # Hash with fast rounds
    new_hash = get_password_hash(new_password)
    
    # Update in DB
    result = await database.users.update_one(
        {"email": email},
        {"$set": {"hashed_password": new_hash}}
    )
    
    if result.modified_count > 0:
        print(f"✅ Updated password for {email}")
    else:
        print(f"❌ User not found or already updated: {email}")
    
    await db.close_db()

if __name__ == "__main__":
    asyncio.run(fix_password())
