from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse
from app.core.dependencies import get_current_user
from app.core.permissions import require_roles

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # RBAC: only ADMIN / MANAGER
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to create tasks",
        )

    new_task = Task(
        title=task.title,
        description=task.description,
        created_by_id=current_user.id,
        assigned_to_id=task.assigned_to_id,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task

@router.get("/", response_model=list[TaskResponse])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role in ("ADMIN", "MANAGER"):
        return db.query(Task).all()

    # EMPLOYEE: only own tasks
    return db.query(Task).filter(
        Task.assigned_to_id == current_user.id
    ).all()

@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: UUID,
    status: TaskStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # EMPLOYEE can update only their own tasks
    if current_user.role == "EMPLOYEE":
        if task.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only update your own tasks"
            )

    task.status = status
    db.commit()
    db.refresh(task)
    return task
