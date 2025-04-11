from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from app.core.config import settings
from pymongo import MongoClient
from typing import Generator

# PostgreSQL
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# MongoDB
mongo_client = MongoClient(settings.MONGODB_URL)
mongo_db = mongo_client.get_database()

def get_db() -> Generator:
    """Get PostgreSQL database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_mongo_db():
    """Get MongoDB database instance"""
    return mongo_db 