from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from app.models.enums import UserRole
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Optional[UserRole] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
