from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EmailProvider(str, Enum):
    GMAIL = "gmail"
    OUTLOOK = "outlook"
    YAHOO = "yahoo"

class AccountStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    LOCKED = "locked"
    PENDING = "pending"

class EmailAccountBase(BaseModel):
    email: EmailStr
    provider: EmailProvider
    status: AccountStatus = AccountStatus.PENDING
    last_activity: Optional[datetime] = None
    proxy_id: Optional[str] = None
    session_data: Optional[dict] = None
    metadata: Optional[dict] = None

class EmailAccountCreate(EmailAccountBase):
    password: str

class EmailAccount(EmailAccountBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EmailAccountUpdate(BaseModel):
    status: Optional[AccountStatus] = None
    proxy_id: Optional[str] = None
    session_data: Optional[dict] = None
    metadata: Optional[dict] = None

class EmailAccountStats(BaseModel):
    total_emails_processed: int = 0
    spam_moved_to_inbox: int = 0
    emails_marked_important: int = 0
    emails_starred: int = 0
    links_clicked: int = 0
    replies_sent: int = 0
    last_successful_action: Optional[datetime] = None
    failure_count: int = 0 