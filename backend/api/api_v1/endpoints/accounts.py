from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.email_account import EmailAccount, EmailAccountCreate, EmailAccountUpdate, EmailAccountStats
from app.models.database import EmailAccount as DBEmailAccount
from app.services.email_provider import EmailProviderFactory
from app.services.proxy_manager import ProxyManager

router = APIRouter()

@router.post("/accounts/", response_model=EmailAccount, status_code=status.HTTP_201_CREATED)
async def create_account(account: EmailAccountCreate, db: Session = Depends(get_db)):
    """Create a new email account"""
    db_account = DBEmailAccount(
        email=account.email,
        provider=account.provider,
        status=account.status,
        metadata=account.metadata
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.get("/accounts/", response_model=List[EmailAccount])
async def list_accounts(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    provider: str = None,
    db: Session = Depends(get_db)
):
    """List email accounts with optional filtering"""
    query = db.query(DBEmailAccount)
    
    if status:
        query = query.filter(DBEmailAccount.status == status)
    if provider:
        query = query.filter(DBEmailAccount.provider == provider)
        
    return query.offset(skip).limit(limit).all()

@router.get("/accounts/{account_id}", response_model=EmailAccount)
async def get_account(account_id: str, db: Session = Depends(get_db)):
    """Get email account by ID"""
    account = db.query(DBEmailAccount).filter(DBEmailAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/accounts/{account_id}", response_model=EmailAccount)
async def update_account(
    account_id: str,
    account_update: EmailAccountUpdate,
    db: Session = Depends(get_db)
):
    """Update email account"""
    db_account = db.query(DBEmailAccount).filter(DBEmailAccount.id == account_id).first()
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    for field, value in account_update.dict(exclude_unset=True).items():
        setattr(db_account, field, value)
        
    db.commit()
    db.refresh(db_account)
    return db_account

@router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(account_id: str, db: Session = Depends(get_db)):
    """Delete email account"""
    db_account = db.query(DBEmailAccount).filter(DBEmailAccount.id == account_id).first()
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    db.delete(db_account)
    db.commit()

@router.get("/accounts/{account_id}/stats", response_model=EmailAccountStats)
async def get_account_stats(account_id: str, db: Session = Depends(get_db)):
    """Get email account statistics"""
    account = db.query(DBEmailAccount).filter(DBEmailAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    return EmailAccountStats(
        total_emails_processed=account.total_emails_processed,
        spam_moved_to_inbox=account.spam_moved_to_inbox,
        emails_marked_important=account.emails_marked_important,
        emails_starred=account.emails_starred,
        links_clicked=account.links_clicked,
        replies_sent=account.replies_sent,
        last_successful_action=account.last_activity,
        failure_count=account.failure_count
    ) 