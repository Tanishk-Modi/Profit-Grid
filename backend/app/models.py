from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

class WatchlistItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    symbol: str = Field(index=True)

    # Foreign Key to link to User
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="watchlist_items")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str

    watchlist_items: List["WatchlistItem"] = Relationship(back_populates="user")