from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "email_warmup",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.email_tasks"]
)

# Celery Configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_annotations={
        "*": {
            "rate_limit": "10/m",  # 10 tasks per minute per worker
        }
    }
)

# Task routing
celery_app.conf.task_routes = {
    "app.tasks.email_tasks.*": {"queue": "email_tasks"},
    "app.tasks.monitoring_tasks.*": {"queue": "monitoring"},
}

# Error handling
celery_app.conf.task_annotations = {
    "*": {
        "on_failure": "app.tasks.utils.handle_task_failure",
        "on_retry": "app.tasks.utils.handle_task_retry",
        "on_success": "app.tasks.utils.handle_task_success",
    }
} 