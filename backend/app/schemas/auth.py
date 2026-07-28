from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    username: EmailStr # Standard OAuth2 uses username for email
    password: str
    remember_me: Optional[bool] = False

class RefreshRequest(BaseModel):
    refresh_token: str
