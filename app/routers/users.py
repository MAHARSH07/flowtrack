from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import hash_password
from app.core.dependencies import get_current_user
from app.core.permissions import require_roles


router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )

    new_user = User(
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        hashed_password=hash_password(user.password)
    )


    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    return db.query(User).all()

@router.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/elevated")
def elevated_access(
    current_user: User = Depends(require_roles("ADMIN", "MANAGER"))
):
    return {"message": "You have elevated access"}
