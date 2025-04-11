from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.task import Task, TaskCreate, TaskUpdate, TaskStats
from app.models.database import Task as DBTask
from app.tasks.celery_app import celery_app
from app.tasks.email_tasks import (
    move_from_spam,
    mark_important,
    star_email,
    click_link,
    reply_email
)

router = APIRouter()

@router.post("/tasks/", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    db_task = DBTask(
        task_type=task.task_type,
        account_id=task.account_id,
        priority=task.priority,
        parameters=task.parameters,
        max_retries=task.max_retries
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Start the task in Celery
    task_functions = {
        "move_from_spam": move_from_spam,
        "mark_important": mark_important,
        "star_email": star_email,
        "click_link": click_link,
        "reply_email": reply_email
    }
    
    task_function = task_functions.get(task.task_type)
    if task_function:
        task_function.delay(db_task.account_id, db_task.id)
    
    return db_task

@router.get("/tasks/", response_model=List[Task])
async def list_tasks(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    account_id: str = None,
    db: Session = Depends(get_db)
):
    """List tasks with optional filtering"""
    query = db.query(DBTask)
    
    if status:
        query = query.filter(DBTask.status == status)
    if account_id:
        query = query.filter(DBTask.account_id == account_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str, db: Session = Depends(get_db)):
    """Get task by ID"""
    task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    db: Session = Depends(get_db)
):
    """Update task"""
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(db_task, field, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/tasks/stats", response_model=TaskStats)
async def get_task_stats(db: Session = Depends(get_db)):
    """Get task statistics"""
    total_tasks = db.query(DBTask).count()
    pending_tasks = db.query(DBTask).filter(DBTask.status == "pending").count()
    running_tasks = db.query(DBTask).filter(DBTask.status == "running").count()
    completed_tasks = db.query(DBTask).filter(DBTask.status == "completed").count()
    failed_tasks = db.query(DBTask).filter(DBTask.status == "failed").count()
    
    # Calculate success rate
    success_rate = 0.0
    if total_tasks > 0:
        success_rate = completed_tasks / total_tasks
        
    # Calculate average execution time
    avg_execution_time = 0.0
    completed_tasks_with_time = db.query(DBTask).filter(
        DBTask.status == "completed",
        DBTask.started_at.isnot(None),
        DBTask.completed_at.isnot(None)
    ).all()
    
    if completed_tasks_with_time:
        total_time = sum(
            (task.completed_at - task.started_at).total_seconds()
            for task in completed_tasks_with_time
        )
        avg_execution_time = total_time / len(completed_tasks_with_time)
    
    return TaskStats(
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        running_tasks=running_tasks,
        completed_tasks=completed_tasks,
        failed_tasks=failed_tasks,
        average_execution_time=avg_execution_time,
        success_rate=success_rate
    ) 