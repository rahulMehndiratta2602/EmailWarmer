from typing import Optional, Dict, Any
import aiohttp
import random
from app.core.config import settings

class ProxyManager:
    def __init__(self):
        self.proxy_service = settings.PROXY_SERVICE
        self.api_key = settings.PROXY_API_KEY
        self.session = None
        self.proxy_pool = []
        self.current_proxy = None

    async def _init_session(self):
        """Initialize aiohttp session if not already initialized"""
        if not self.session:
            self.session = aiohttp.ClientSession()

    async def _fetch_proxies(self):
        """Fetch proxies from the selected proxy service"""
        await self._init_session()
        
        if self.proxy_service == "brightdata":
            url = "https://api.brightdata.com/proxy"
            headers = {"Authorization": f"Bearer {self.api_key}"}
        elif self.proxy_service == "smartproxy":
            url = "https://api.smartproxy.com/proxies"
            headers = {"Authorization": f"Basic {self.api_key}"}
        else:
            raise ValueError(f"Unsupported proxy service: {self.proxy_service}")

        async with self.session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                self.proxy_pool = data.get("proxies", [])
            else:
                raise Exception(f"Failed to fetch proxies: {response.status}")

    async def get_proxy(self) -> Dict[str, Any]:
        """Get a random proxy from the pool"""
        if not self.proxy_pool:
            await self._fetch_proxies()

        if not self.proxy_pool:
            raise Exception("No proxies available")

        # Select a random proxy
        self.current_proxy = random.choice(self.proxy_pool)
        
        # Format proxy based on service
        if self.proxy_service == "brightdata":
            proxy_url = f"http://{self.current_proxy['username']}:{self.current_proxy['password']}@{self.current_proxy['host']}:{self.current_proxy['port']}"
        elif self.proxy_service == "smartproxy":
            proxy_url = f"http://{self.current_proxy['ip']}:{self.current_proxy['port']}"
        else:
            raise ValueError(f"Unsupported proxy service: {self.proxy_service}")

        return {
            "server": proxy_url,
            "username": self.current_proxy.get("username"),
            "password": self.current_proxy.get("password")
        }

    async def mark_proxy_failed(self, proxy: Dict[str, Any]):
        """Mark a proxy as failed and remove it from the pool"""
        if proxy in self.proxy_pool:
            self.proxy_pool.remove(proxy)
            if self.current_proxy == proxy:
                self.current_proxy = None

    async def close(self):
        """Close the aiohttp session"""
        if self.session:
            await self.session.close()
            self.session = None 