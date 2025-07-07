from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database import get_session
from app.crud import crud_users

from app.schemas.user_schemas import UserCreate, UserLogin, UserPublic

from app.core.security import verify_password, get_password_hash

router = APIRouter()

# User Registration Endpoint

@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register_user(
    user_create: UserCreate, 
    session: Session = Depends(get_session) 
):
    """
    Register a new user.
    - Checks if username already exists.
    - Hashes password and stores user in DB.
    """
    # Check if a user with this username already exists
    db_user = crud_users.get_user_by_username(session, username=user_create.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered"
        )

    # Create the user in the database
    new_user = crud_users.create_user(session, user_create=user_create)

    return new_user 

# Endpoint for User Login
@router.post("/login")
def login_for_access_token(
    user_login: UserLogin, 
    session: Session = Depends(get_session) 
):
    """
    Authenticate a user and return a placeholder access token.
    """
    user = crud_users.get_user_by_username(session, username=user_login.username)
    if not user or not verify_password(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}, 
        )

    # For MVP, return a simple success message and a placeholder token
    # In a real app, this would be a securely generated JWT
    access_token = "your-secret-placeholder-token" # Replace with actual JWT generation later
    return {"message": "Login successful", "access_token": access_token, "user_id": user.id, "username": user.username}

