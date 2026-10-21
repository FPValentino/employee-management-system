from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserRead, UserLogin, Token
from app.models.user import User
from app.security import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserRead, status_code=201)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    statement = select(User).where(User.email.ilike(user_data.email))
    existing_user = db.scalar(statement)

    if existing_user is not None:
            raise HTTPException(
                status_code=400,
                detail="Email already registered."
            )
    
    user = User(
          email=user_data.email,
          password_hash=hash_password(user_data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.post("/login", response_model=Token)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    statement = select(User).where(User.email.ilike(user_data.email))
    existing_user = db.scalar(statement)

    if existing_user is None:
         raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
                )

    is_valid = verify_password(user_data.password, existing_user.password_hash)

    if not is_valid:
          raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
                )

    payload = {"sub": str(existing_user.id)}
    token = create_access_token(payload)

    return Token(
         access_token=token,
         token_type="bearer"
    )

@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
     return current_user

@router.post("/token", response_model=Token)
def issue_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    statement = select(User).where(User.email.ilike(form_data.username)) 

    existing_user = db.scalar(statement)

    if existing_user is None:
         raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
                )

    is_valid = verify_password(form_data.password, existing_user.password_hash)

    if not is_valid:
          raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
                )

    payload = {"sub": str(existing_user.id)}
    token = create_access_token(payload)

    return Token(
         access_token=token,
         token_type="bearer"
    )