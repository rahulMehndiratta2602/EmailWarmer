from sqlalchemy import Column, String, Enum, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class EmailAccount(Base):
    __tablename__ = "email_accounts"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False)
    provider = Column(Enum("gmail", "outlook", "yahoo", name="email_provider"), nullable=False)
    status = Column(Enum("active", "suspended", "locked", "pending", name="account_status"), default="pending")
    last_activity = Column(DateTime, nullable=True)
    proxy_id = Column(String, nullable=True)
    session_data = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Statistics
    total_emails_processed = Column(Integer, default=0)
    spam_moved_to_inbox = Column(Integer, default=0)
    emails_marked_important = Column(Integer, default=0)
    emails_starred = Column(Integer, default=0)
    links_clicked = Column(Integer, default=0)
    replies_sent = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)

    # Relationships
    tasks = relationship("Task", back_populates="account")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    task_type = Column(Enum(
        "move_from_spam", "mark_important", "star_email", 
        "click_link", "reply_email", "login", "logout",
        name="task_type"
    ), nullable=False)
    account_id = Column(String, ForeignKey("email_accounts.id"), nullable=False)
    priority = Column(Integer, default=2)  # 1: LOW, 2: MEDIUM, 3: HIGH, 4: CRITICAL
    parameters = Column(JSON, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    status = Column(Enum(
        "pending", "running", "completed", "failed", "retrying",
        name="task_status"
    ), default="pending")
    error_message = Column(String, nullable=True)
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    account = relationship("EmailAccount", back_populates="tasks") 