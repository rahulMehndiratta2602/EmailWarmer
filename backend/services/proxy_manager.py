from typing import List, Dict, Optional
import time
import random
from datetime import datetime, timedelta
import redis
from fastapi import HTTPException

class Proxy:
    def __init__(self, ip: str, port: int, username: str, password: str, proxy_type: str):
        self.ip = ip
        self.port = port
        self.username = username
        self.password = password
        self.type = proxy_type
        self.last_used = None
        self.failure_count = 0
        self.response_time = 0
        self.health_status = True

class ProxyManager:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.Redis.from_url(redis_url)
        self.active_pool: List[Proxy] = []
        self.backup_pool: List[Proxy] = []
        self.health_check_interval = 300  # 5 minutes
        self.max_failures = 3
        self.response_time_threshold = 500  # ms

    async def load_proxies_from_file(self, file_path: str) -> None:
        """Load proxies from a CSV/TXT file"""
        try:
            with open(file_path, 'r') as f:
                lines = f.readlines()
                for line in lines[1:]:  # Skip header
                    ip, port, username, password, proxy_type = line.strip().split(',')
                    proxy = Proxy(ip, int(port), username, password, proxy_type)
                    self.active_pool.append(proxy)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error loading proxies: {str(e)}")

    async def get_next_proxy(self) -> Proxy:
        """Get the next available proxy using weighted round-robin"""
        if not self.active_pool:
            if not self.backup_pool:
                raise HTTPException(status_code=503, detail="No available proxies")
            # Move a proxy from backup to active
            proxy = self.backup_pool.pop(0)
            self.active_pool.append(proxy)

        # Weighted selection based on response time and failure count
        weights = [
            1 / (proxy.response_time + 1) * (1 / (proxy.failure_count + 1))
            for proxy in self.active_pool
        ]
        total_weight = sum(weights)
        weights = [w / total_weight for w in weights]
        
        proxy = random.choices(self.active_pool, weights=weights, k=1)[0]
        proxy.last_used = datetime.now()
        return proxy

    async def check_proxy_health(self, proxy: Proxy) -> bool:
        """Check if a proxy is healthy"""
        try:
            start_time = time.time()
            # Implement actual health check logic here
            # For now, just simulate a check
            response_time = (time.time() - start_time) * 1000
            
            if response_time > self.response_time_threshold:
                proxy.health_status = False
                return False
            
            proxy.response_time = response_time
            proxy.health_status = True
            return True
        except Exception:
            proxy.health_status = False
            return False

    async def update_proxy_status(self, proxy: Proxy, success: bool) -> None:
        """Update proxy status based on task result"""
        if success:
            proxy.failure_count = max(0, proxy.failure_count - 1)
        else:
            proxy.failure_count += 1
            if proxy.failure_count >= self.max_failures:
                self.active_pool.remove(proxy)
                self.backup_pool.append(proxy)

    async def rotate_proxies(self) -> None:
        """Periodically rotate and check proxy health"""
        for proxy in self.active_pool + self.backup_pool:
            is_healthy = await self.check_proxy_health(proxy)
            if not is_healthy and proxy in self.active_pool:
                self.active_pool.remove(proxy)
                self.backup_pool.append(proxy)
            elif is_healthy and proxy in self.backup_pool:
                self.backup_pool.remove(proxy)
                self.active_pool.append(proxy)

    def get_proxy_stats(self) -> Dict:
        """Get proxy pool statistics"""
        return {
            "active_proxies": len(self.active_pool),
            "backup_proxies": len(self.backup_pool),
            "total_proxies": len(self.active_pool) + len(self.backup_pool),
            "average_response_time": sum(p.response_time for p in self.active_pool) / len(self.active_pool) if self.active_pool else 0,
            "unhealthy_proxies": sum(1 for p in self.active_pool + self.backup_pool if not p.health_status)
        } 