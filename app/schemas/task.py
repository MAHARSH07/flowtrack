from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.task import TaskStatus
from app.schemas.user import UserResponse  


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    assigned_to_id: UUID | None = None


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: TaskStatus
    created_by_id: UUID
    assigned_to_id: UUID | None

    assigned_to: UserResponse | None  

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskUpdateStatus(BaseModel):
    status: TaskStatus
