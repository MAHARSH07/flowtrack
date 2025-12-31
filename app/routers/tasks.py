from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from fastapi import Query
from sqlalchemy import or_

from app.database import get_db
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdateStatus
from app.core.dependencies import get_current_user
from app.core.permissions import require_roles

router = APIRouter(prefix="/tasks", tags=["Tasks"])

VALID_TRANSITIONS = {
    TaskStatus.TODO: [TaskStatus.IN_PROGRESS],
    TaskStatus.IN_PROGRESS: [TaskStatus.DONE],
    TaskStatus.DONE: [],
}


@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only ADMIN / MANAGER can create tasks
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to create tasks",
        )

    # Assignment validation (if assignment requested)
    if task.assigned_to_id:
        assignee = db.query(User).filter(User.id == task.assigned_to_id).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user does not exist",
            )

        if assignee.role != "EMPLOYEE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tasks can only be assigned to EMPLOYEE users",
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
    status: Optional[TaskStatus] = Query(None),
    assigned: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    query = db.query(Task)

    # RBAC base query
    if current_user.role not in ("ADMIN", "MANAGER"):
        query = query.filter(Task.assigned_to_id == current_user.id)

    # Status filter
    if status:
        query = query.filter(Task.status == status)

    # Assignment filter
    if assigned == "me":
        query = query.filter(Task.assigned_to_id == current_user.id)

    elif assigned == "unassigned":
        if current_user.role not in ("ADMIN", "MANAGER"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to view unassigned tasks",
            )
        query = query.filter(Task.assigned_to_id.is_(None))

    # Search (title + description)
    if q:
        query = query.filter(
            or_(
                Task.title.ilike(f"%{q}%"),
                Task.description.ilike(f"%{q}%"),
            )
        )


    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: UUID,
    payload: TaskUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # EMPLOYEE restrictions
    if current_user.role == "EMPLOYEE":
        # Can only update assigned tasks
        if task.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your assigned tasks",
            )

        # Can only move to next valid status
        allowed = VALID_TRANSITIONS.get(task.status, [])
        if payload.status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from {task.status}",
            )

    # ADMIN / MANAGER can override workflow
    task.status = payload.status
    db.commit()
    db.refresh(task)

    return task

@router.patch("/{task_id}/assign", response_model=TaskResponse)
def assign_task(
    task_id: UUID,
    assignee_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # RBAC
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to assign tasks",
        )

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    assignee = db.query(User).filter(User.id == assignee_id).first()
    if not assignee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assigned user does not exist",
        )

    if assignee.role != "EMPLOYEE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tasks can only be assigned to EMPLOYEE users",
        )

    task.assigned_to_id = assignee_id
    db.commit()
    db.refresh(task)

    return task
