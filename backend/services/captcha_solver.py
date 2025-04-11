import aiohttp
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class CaptchaSolver:
    def __init__(self):
        self.api_key = settings.CAPTCHA_API_KEY
        self.service = settings.CAPTCHA_SERVICE
        self.session = None

    async def _init_session(self):
        """Initialize aiohttp session if not already initialized"""
        if not self.session:
            self.session = aiohttp.ClientSession()

    async def solve_recaptcha(self, site_key: str, page_url: str) -> Optional[str]:
        """Solve reCAPTCHA using the configured service"""
        try:
            await self._init_session()

            if self.service == "2captcha":
                # Create task
                create_task_url = "https://2captcha.com/in.php"
                data = {
                    "key": self.api_key,
                    "method": "userrecaptcha",
                    "googlekey": site_key,
                    "pageurl": page_url,
                    "json": 1
                }
                
                async with self.session.post(create_task_url, data=data) as response:
                    if response.status != 200:
                        logger.error(f"Failed to create 2captcha task: {response.status}")
                        return None
                    
                    result = await response.json()
                    if result["status"] != 1:
                        logger.error(f"2captcha task creation failed: {result['request']}")
                        return None
                    
                    task_id = result["request"]
                    
                    # Poll for result
                    get_result_url = f"https://2captcha.com/res.php?key={self.api_key}&action=get&id={task_id}&json=1"
                    while True:
                        await asyncio.sleep(5)  # Wait 5 seconds between checks
                        async with self.session.get(get_result_url) as response:
                            if response.status != 200:
                                continue
                            
                            result = await response.json()
                            if result["status"] == 1:
                                return result["request"]
                            elif result["request"] != "CAPCHA_NOT_READY":
                                logger.error(f"2captcha solving failed: {result['request']}")
                                return None

            elif self.service == "anti-captcha":
                # Create task
                create_task_url = "https://api.anti-captcha.com/createTask"
                data = {
                    "clientKey": self.api_key,
                    "task": {
                        "type": "RecaptchaV2TaskProxyless",
                        "websiteURL": page_url,
                        "websiteKey": site_key
                    }
                }
                
                async with self.session.post(create_task_url, json=data) as response:
                    if response.status != 200:
                        logger.error(f"Failed to create anti-captcha task: {response.status}")
                        return None
                    
                    result = await response.json()
                    if result["errorId"] != 0:
                        logger.error(f"Anti-captcha task creation failed: {result['errorDescription']}")
                        return None
                    
                    task_id = result["taskId"]
                    
                    # Poll for result
                    get_result_url = "https://api.anti-captcha.com/getTaskResult"
                    while True:
                        await asyncio.sleep(5)  # Wait 5 seconds between checks
                        data = {
                            "clientKey": self.api_key,
                            "taskId": task_id
                        }
                        async with self.session.post(get_result_url, json=data) as response:
                            if response.status != 200:
                                continue
                            
                            result = await response.json()
                            if result["errorId"] != 0:
                                logger.error(f"Anti-captcha solving failed: {result['errorDescription']}")
                                return None
                            
                            if result["status"] == "ready":
                                return result["solution"]["gRecaptchaResponse"]
                            elif result["status"] != "processing":
                                logger.error(f"Anti-captcha solving failed: {result['status']}")
                                return None

            else:
                logger.error(f"Unsupported CAPTCHA service: {self.service}")
                return None

        except Exception as e:
            logger.error(f"CAPTCHA solving failed: {str(e)}")
            return None

    async def close(self):
        """Close the aiohttp session"""
        if self.session:
            await self.session.close()
            self.session = None 