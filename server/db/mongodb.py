"""
MongoDB Connection Handler
Async MongoDB client using Motor
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import MongoClient
from config.settings import get_settings
from typing import Optional

settings = get_settings()


class MongoDB:
    """MongoDB connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    @classmethod
    async def connect(cls):
        """Initialize MongoDB connection"""
        cls.client = AsyncIOMotorClient(settings.mongodb_uri)
        cls.db = cls.client[settings.mongodb_db_name]
        
        # Test connection
        try:
            await cls.client.admin.command('ping')
            print(f"✅ Connected to MongoDB: {settings.mongodb_db_name}")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            raise
    
    @classmethod
    async def disconnect(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("📤 MongoDB connection closed")
    
    @classmethod
    def get_db(cls) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if cls.db is None:
            raise RuntimeError("MongoDB not connected. Call connect() first.")
        return cls.db


# Collection accessors
def get_users_collection():
    return MongoDB.get_db()["users"]

def get_tests_collection():
    return MongoDB.get_db()["tests"]

def get_questions_collection():
    return MongoDB.get_db()["questions"]

def get_attempts_collection():
    return MongoDB.get_db()["attempts"]

def get_roadmaps_collection():
    return MongoDB.get_db()["roadmaps"]
