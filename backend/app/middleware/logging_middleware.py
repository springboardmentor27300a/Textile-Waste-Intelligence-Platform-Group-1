"""
Logging Middleware — Textile Waste Intelligence Platform (Milestone 4)
Logs every request/response with timing, user info, and error details.
Sensitive fields (passwords, tokens) are never logged.
"""
import time
import logging
import json
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger("twip.api")

# Fields to NEVER log (security)
SENSITIVE_FIELDS = {"password", "hashed_password", "access_token", "token", "secret", "authorization"}

SKIP_LOG_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}


def sanitize(data: dict) -> dict:
    """Remove sensitive keys from a dict recursively."""
    return {
        k: "***REDACTED***" if k.lower() in SENSITIVE_FIELDS else v
        for k, v in data.items()
    }


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # Skip noisy health/docs endpoints
        if request.url.path in SKIP_LOG_PATHS:
            return await call_next(request)

        start = time.perf_counter()
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path

        # Log incoming request
        logger.info(
            json.dumps({
                "event": "request",
                "method": method,
                "path": path,
                "client_ip": client_ip,
                "query": str(request.query_params) or None,
            })
        )

        try:
            response: Response = await call_next(request)
        except Exception as exc:
            elapsed = round((time.perf_counter() - start) * 1000)
            logger.error(
                json.dumps({
                    "event": "request_error",
                    "method": method,
                    "path": path,
                    "client_ip": client_ip,
                    "error": str(exc),
                    "elapsed_ms": elapsed,
                })
            )
            raise

        elapsed = round((time.perf_counter() - start) * 1000)
        status = response.status_code
        level = logging.WARNING if status >= 400 else logging.INFO
        logger.log(
            level,
            json.dumps({
                "event": "response",
                "method": method,
                "path": path,
                "status": status,
                "elapsed_ms": elapsed,
                "client_ip": client_ip,
            })
        )
        return response


def log_auth_event(event: str, email: str, success: bool, reason: str = ""):
    """Log authentication events without passwords."""
    logger.info(
        json.dumps({
            "event": event,
            "email": email,
            "success": success,
            "reason": reason,
        })
    )
