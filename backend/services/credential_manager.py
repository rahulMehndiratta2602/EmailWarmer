import logging
from typing import Optional
from cryptography.fernet import Fernet
from app.core.config import settings
from app.db.session import get_mongo_db
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class EmailCredentials(BaseModel):
    email: str
    password: str
    provider: str

class CredentialManager:
    def __init__(self):
        self.mongo_db = get_mongo_db()
        self.credentials_collection = self.mongo_db.credentials
        self.cipher_suite = Fernet(settings.SECRET_KEY.encode())

    def _encrypt(self, data: str) -> bytes:
        """Encrypt data using Fernet"""
        return self.cipher_suite.encrypt(data.encode())

    def _decrypt(self, encrypted_data: bytes) -> str:
        """Decrypt data using Fernet"""
        return self.cipher_suite.decrypt(encrypted_data).decode()

    async def store_credentials(self, credentials: EmailCredentials) -> bool:
        """Store encrypted credentials in MongoDB"""
        try:
            encrypted_password = self._encrypt(credentials.password)
            
            document = {
                "email": credentials.email,
                "password": encrypted_password,
                "provider": credentials.provider
            }
            
            await self.credentials_collection.update_one(
                {"email": credentials.email},
                {"$set": document},
                upsert=True
            )
            return True
        except Exception as e:
            logger.error(f"Failed to store credentials: {str(e)}")
            return False

    async def get_credentials(self, email: str) -> Optional[EmailCredentials]:
        """Retrieve and decrypt credentials from MongoDB"""
        try:
            document = await self.credentials_collection.find_one({"email": email})
            if not document:
                return None
                
            decrypted_password = self._decrypt(document["password"])
            return EmailCredentials(
                email=document["email"],
                password=decrypted_password,
                provider=document["provider"]
            )
        except Exception as e:
            logger.error(f"Failed to retrieve credentials: {str(e)}")
            return None

    async def delete_credentials(self, email: str) -> bool:
        """Delete credentials from MongoDB"""
        try:
            result = await self.credentials_collection.delete_one({"email": email})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Failed to delete credentials: {str(e)}")
            return False

    async def update_credentials(self, credentials: EmailCredentials) -> bool:
        """Update existing credentials in MongoDB"""
        try:
            encrypted_password = self._encrypt(credentials.password)
            
            result = await self.credentials_collection.update_one(
                {"email": credentials.email},
                {
                    "$set": {
                        "password": encrypted_password,
                        "provider": credentials.provider
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update credentials: {str(e)}")
            return False 