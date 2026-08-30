"""
CreditLens In-Memory Sliding Window Rate Limiter
Protects high-cost and authentication endpoints from brute-force and resource exhaustion attacks.
"""
import time
from collections import defaultdict, deque
from typing import Dict, Deque
from fastapi import Request, HTTPException, status
from app.core.config import settings

class SlidingWindowRateLimiter:
    """
    Thread-safe in-memory sliding window rate limiter.
    Stores request timestamps per client IP.
    """
    def __init__(self):
        self._records: Dict[str, Deque[float]] = defaultdict(deque)

    def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int = 60
    ) -> bool:
        """
        Checks if request from `key` is allowed within current sliding window.
        Returns True if allowed, False if limit exceeded.
        """
        if not settings.RATE_LIMIT_ENABLED:
            return True

        now = time.time()
        window_start = now - window_seconds
        client_history = self._records[key]

        # Evict timestamps older than the sliding window
        while client_history and client_history[0] < window_start:
            client_history.popleft()

        if len(client_history) >= max_requests:
            return False

        client_history.append(now)
        return True

    def reset(self):
        """Clears all stored rate limit history."""
        self._records.clear()

rate_limiter = SlidingWindowRateLimiter()

def rate_limit_dependency(max_requests: int, window_seconds: int = 60):
    """
    FastAPI dependency factory enforcing rate limits on endpoints.
    """
    async def dependency(request: Request):
        if not settings.RATE_LIMIT_ENABLED:
            return

        # Derive client key from X-Forwarded-For or client host
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        route_key = f"{client_ip}:{request.url.path}"

        allowed = rate_limiter.check_rate_limit(
            key=route_key,
            max_requests=max_requests,
            window_seconds=window_seconds
        )

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Limit of {max_requests} requests per {window_seconds}s exceeded. Please try again later.",
                headers={"Retry-After": str(window_seconds)}
            )

    return dependency
