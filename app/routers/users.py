from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import hash_password
from app.core.dependencies import get_current_user
from app.core.permissions import require_roles
from app.models.enums import UserRole
from app.core.security import decode_access_token
from jose import JWTError

router = APIRouter(prefix="/users", tags=["Users"])

optional_security = HTTPBearer(auto_error=False)

def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security),
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None

    token = credentials.credentials
    payload = decode_access_token(token)

    user = db.query(User).filter(User.id == payload["sub"]).first()
    return user

# @router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
# def create_user(user: UserCreate, db: Session = Depends(get_db)):
#     existing_user = db.query(User).filter(User.email == user.email).first()
#     if existing_user:
#         raise HTTPException(
#             status_code=400,
#             detail="User with this email already exists"
#         )

#     new_user = User(
#         email=user.email,
#         full_name=user.full_name,
#         role=user.role.value,
#         hashed_password=hash_password(user.password)
#     )


#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return new_user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    """
    User creation endpoint.

    Behavior:
    - Public (no auth): can register ONLY as EMPLOYEE
    - ADMIN / MANAGER: can create users with any role
    - EMPLOYEE: forbidden
    """

    # 🟢 Public signup → force EMPLOYEE
    if current_user is None:
        user.role = UserRole.EMPLOYEE

    # 🔴 Authenticated but insufficient role
    elif current_user.role not in ("ADMIN", "MANAGER"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to create users"
        )

    # 🟢 ADMIN / MANAGER → allowed

    # Duplicate check
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    new_user = User(
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        hashed_password=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/", response_model=list[dict])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed",
        )

    users = (
        db.query(User)
        .filter(User.role == "EMPLOYEE")
        .all()
    )

    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
        }
        for user in users
    ]

@router.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/elevated")
def elevated_access(
    current_user: User = Depends(require_roles("ADMIN", "MANAGER"))
):
    return {"message": "You have elevated access"}
