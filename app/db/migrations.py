from sqlalchemy import create_engine
from app.models.database import Base
from app.core.config import settings

def init_db():
    """Initialize the database with required tables"""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)

def drop_db():
    """Drop all tables from the database"""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.drop_all(bind=engine)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "drop":
        print("Dropping all tables...")
        drop_db()
        print("Done!")
    else:
        print("Initializing database...")
        init_db()
        print("Done!") 