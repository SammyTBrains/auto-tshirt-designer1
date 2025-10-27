"""
Database configuration and connection management for MongoDB
"""
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        try:
            mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
            cls.client = AsyncIOMotorClient(mongodb_url)
            
            # Test the connection
            await cls.client.admin.command('ping')
            logger.info(f"Successfully connected to MongoDB at {mongodb_url}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            logger.warning("Application will run without database persistence")
            cls.client = None
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")
    
    @classmethod
    def get_db(cls):
        """Get database instance"""
        if cls.client:
            db_name = os.getenv("MONGODB_DB_NAME", "tshirt_designer")
            return cls.client[db_name]
        return None

# Global database instance
db = Database()
