from sqlmodel import Session, create_engine, SQLModel
from dotenv import load_dotenv
import os

from app import models

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create SQLAlchemy Engine

engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True) # Remove echo=True in production

# Create database tabels

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Database session dependency

def get_session():
    with Session(engine) as session:
        yield session