from sqlmodel import Session, select
from app.models import User
from app.schemas.user_schemas import UserCreate
from app.core.security import get_password_hash

def get_user_by_username(session: Session, username: str) -> User | None:
    user = session.exec(select(User).where(User.username == username)).first()
    return user

def create_user(session: Session, user_create: UserCreate) -> User:
    """
    Creates a new user in the database after hashing the password.
    """
    # Hash the plain password before storing it
    hashed_password = get_password_hash(user_create.password)

    # Create a new User model instance
    user_to_db = User(
        username=user_create.username,
        hashed_password=hashed_password
    )

    # Add the new user to the session and commit to the database
    session.add(user_to_db)
    session.commit()
    session.refresh(user_to_db) # Refresh to get the generated ID from the DB

    return user_to_db
