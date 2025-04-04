from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Email Warmup Automation"
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/email_warmup")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017/email_warmup")
    
    # Redis Settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Proxy Settings
    PROXY_API_KEY: Optional[str] = os.getenv("PROXY_API_KEY")
    PROXY_SERVICE: str = os.getenv("PROXY_SERVICE", "brightdata")  # brightdata, smartproxy, tor
    
    # Email Provider Settings
    EMAIL_PROVIDERS: list = ["gmail", "outlook", "yahoo"]
    MAX_ACCOUNTS_PER_WORKER: int = 100
    
    # Task Settings
    TASK_RETRY_DELAY: int = 300  # 5 minutes
    MAX_TASK_RETRIES: int = 3
    
    # Monitoring
    MONITORING_INTERVAL: int = 60  # seconds
    ALERT_THRESHOLD: float = 0.1  # 10% failure rate
    
    class Config:
        case_sensitive = True

settings = Settings() 