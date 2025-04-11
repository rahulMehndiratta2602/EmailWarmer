from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Account, Task, Proxy, Setting, Activity
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database URL - Update this with your actual database URL
DATABASE_URL = "sqlite:///./email_warmup.db"

def init_database():
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Initialize default settings if they don't exist
        default_settings = [
            {"key": "max_tasks_per_account", "value": "5"},
            {"key": "task_interval_minutes", "value": "30"},
            {"key": "proxy_rotation_interval", "value": "60"},
            {"key": "max_retries", "value": "3"},
            {"key": "retry_delay_seconds", "value": "300"}
        ]
        
        for setting in default_settings:
            if not db.query(Setting).filter(Setting.key == setting["key"]).first():
                new_setting = Setting(**setting)
                db.add(new_setting)
        
        db.commit()
        logger.info("Default settings initialized")
        
        db.close()
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

if __name__ == "__main__":
    init_database() 