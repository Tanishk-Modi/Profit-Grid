from pydantic import BaseModel, Field
from typing import List, Optional

# Schema for user creation (input for registration)
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=6)

# Schema for user login (input for authentication)
class UserLogin(BaseModel):
    username: str
    password: str

# Schema for public user data 
class UserPublic(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True 

# Schema for creating a WatchlistItem 
class WatchlistItemCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10) # Stock symbol

# Schema for public WatchlistItem data 
class WatchlistItemPublic(BaseModel):
    id: int
    symbol: str
    user_id: int # To show which user owns it 

    class Config:
        from_attributes = True # Allows Pydantic to read from ORM models
class UserWithWatchlist(UserPublic):
    watchlist_items: List[WatchlistItemPublic] = []
