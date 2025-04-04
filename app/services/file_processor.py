from typing import List, Dict, Tuple
import csv
from fastapi import HTTPException
from app.models.email_account import EmailAccount
from app.services.proxy_manager import Proxy

class FileProcessor:
    @staticmethod
    async def process_email_file(file_path: str) -> List[EmailAccount]:
        """Process email accounts from CSV/TXT file"""
        accounts = []
        try:
            with open(file_path, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    account = EmailAccount(
                        email=row['email'],
                        password=row['password'],
                        provider=row.get('provider', 'gmail'),
                        status='active'
                    )
                    accounts.append(account)
            return accounts
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing email file: {str(e)}"
            )

    @staticmethod
    async def process_proxy_file(file_path: str) -> List[Proxy]:
        """Process proxy list from CSV/TXT file"""
        proxies = []
        try:
            with open(file_path, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    proxy = Proxy(
                        ip=row['ip'],
                        port=int(row['port']),
                        username=row['username'],
                        password=row['password'],
                        proxy_type=row['type']
                    )
                    proxies.append(proxy)
            return proxies
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing proxy file: {str(e)}"
            )

    @staticmethod
    async def validate_file_format(file_path: str, file_type: str) -> bool:
        """Validate the format of input files"""
        try:
            with open(file_path, 'r') as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames
                
                if file_type == 'email':
                    required_fields = {'email', 'password'}
                    return all(field in headers for field in required_fields)
                elif file_type == 'proxy':
                    required_fields = {'ip', 'port', 'username', 'password', 'type'}
                    return all(field in headers for field in required_fields)
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid file type: {file_type}"
                    )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error validating file: {str(e)}"
            ) 