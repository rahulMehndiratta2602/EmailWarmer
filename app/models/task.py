from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class TaskType(str, Enum):
    MOVE_FROM_SPAM = "move_from_spam"
    MARK_IMPORTANT = "mark_important"
    STAR_EMAIL = "star_email"
    CLICK_LINK = "click_link"
    REPLY_EMAIL = "reply_email"
    LOGIN = "login"
    LOGOUT = "logout"

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"

class TaskPriority(int, Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

class TaskBase(BaseModel):
    task_type: TaskType
    account_id: str
    priority: TaskPriority = TaskPriority.MEDIUM
    parameters: Optional[Dict[str, Any]] = None
    retry_count: int = 0
    max_retries: int = 3
    status: TaskStatus = TaskStatus.PENDING

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: str
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    retry_count: Optional[int] = None
    error_message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class TaskStats(BaseModel):
    total_tasks: int = 0
    pending_tasks: int = 0
    running_tasks: int = 0
    completed_tasks: int = 0
    failed_tasks: int = 0
    average_execution_time: float = 0.0
    success_rate: float = 0.0 