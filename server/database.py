"""
Database configuration and connection management for MongoDB
Includes retry logic to handle transient DNS/network errors and a small
helper to allow lazy reconnection from request handlers.
"""
import os
import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None

    @classmethod
    async def connect_db(cls, retries: int = 3, timeout_ms: int = 5000) -> None:
        """Connect to MongoDB with retries.

        Args:
            retries: number of attempts before giving up
            timeout_ms: server selection timeout in milliseconds for each attempt
        """
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        attempt = 0
        last_exc: Optional[Exception] = None

        while attempt < retries:
            attempt += 1
            try:
                logger.info(f"Attempting MongoDB connection (attempt {attempt}/{retries}) to {mongodb_url}")
                # set a short serverSelectionTimeout to fail fast on bad DNS
                cls.client = AsyncIOMotorClient(mongodb_url, serverSelectionTimeoutMS=timeout_ms)
                # Test the connection
                await cls.client.admin.command("ping")
                logger.info(f"Successfully connected to MongoDB at {mongodb_url}")
                return
            except Exception as e:
                last_exc = e
                logger.error(f"Failed to connect to MongoDB (attempt {attempt}): {str(e)}")
                # Close any partially opened client
                try:
                    if cls.client:
                        cls.client.close()
                except Exception:
                    pass
                cls.client = None
                # exponential backoff
                backoff = attempt * 2
                logger.info(f"Retrying MongoDB connection in {backoff}s...")
                await asyncio.sleep(backoff)

        logger.warning("Application will run without database persistence after failing all MongoDB connection attempts")
        if last_exc:
            logger.debug(f"Last MongoDB connection error: {last_exc}")

    @classmethod
    async def close_db(cls) -> None:
        """Close MongoDB connection"""
        if cls.client:
            try:
                cls.client.close()
                logger.info("MongoDB connection closed")
            except Exception as e:
                logger.error(f"Error closing MongoDB connection: {e}")

    @classmethod
    def get_db(cls):
        """Get database instance (or None if not connected)"""
        if cls.client:
            db_name = os.getenv("MONGODB_DB_NAME", "tshirt_designer")
            return cls.client[db_name]
        return None

    @classmethod
    async def ensure_connected(cls) -> bool:
        """Ensure we have a connection to MongoDB; attempt to connect if not.

        Returns True if connected, False otherwise.
        """
        if cls.get_db():
            return True
        await cls.connect_db()
        return cls.get_db() is not None


# Global database instance
db = Database()
