from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True
    is_demo: bool = False

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    """
    Fields a member may change from Settings. `email` is intentionally NOT here:
    it is the authentication identity and is immutable via this endpoint.
    """
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    designation: Optional[str] = Field(None, max_length=120)

class UserResponse(UserBase):
    id: int
    designation: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
