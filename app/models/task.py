from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class TaskType(str, Enum):
    MOVE_FROM_SPAM = "move_from_spam"
    MARK_IMPORTANT = "mark_important"
    STAR_EMAIL = "star_email"
    OPEN_EMAIL = "open_email"
    REPLY_EMAIL = "reply_email"
    ARCHIVE_EMAIL = "archive_email"
    LABEL_MANAGEMENT = "label_management"
    SEARCH_INTERACTION = "search_interaction"
    FOLDER_ORGANIZATION = "folder_organization"
    CONTACT_ADDITION = "contact_addition"
    DRAFT_CREATION = "draft_creation"
    FILTER_CREATION = "filter_creation"
    SETTINGS_ADJUSTMENT = "settings_adjustment"
    ATTACHMENT_HANDLING = "attachment_handling"
    LINK_CLICKING = "link_clicking"

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

class HumanBehaviorParams(BaseModel):
    min_delay: int = Field(default=1000, description="Minimum delay in milliseconds")
    max_delay: int = Field(default=3000, description="Maximum delay in milliseconds")
    mouse_movement_variation: float = Field(default=0.2, description="Mouse movement variation factor")
    typing_speed_variation: float = Field(default=0.3, description="Typing speed variation factor")
    scroll_behavior: Dict[str, Any] = Field(
        default={
            "speed_variation": 0.2,
            "pause_probability": 0.3,
            "pause_duration": (500, 2000)
        },
        description="Scroll behavior parameters"
    )

class Task(TaskBase):
    id: str
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    schedule: Dict[str, Any] = Field(
        default={
            "start_time": datetime.now(),
            "frequency": "daily",
            "interval": 24
        }
    )
    human_behavior: HumanBehaviorParams = Field(default_factory=HumanBehaviorParams)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    progress: float = 0.0
    error_count: int = 0
    success_count: int = 0
    proxy_id: Optional[int] = None

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