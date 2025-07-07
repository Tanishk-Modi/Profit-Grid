from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from app.database import get_session
from app.crud import crud_watchlists
from app.schemas.user_schemas import WatchlistItemCreate, WatchlistItemPublic 
from app.core.security import get_current_user_id 

router = APIRouter()

# --- Endpoint to Get User's Watchlist ---
@router.get("/", response_model=List[WatchlistItemPublic])
def get_user_watchlist(
    current_user_id: int = Depends(get_current_user_id), 
    session: Session = Depends(get_session)
):
    """
    Retrieve all watchlist items for the authenticated user.
    """
    watchlist = crud_watchlists.get_watchlist_by_user(session, user_id=current_user_id)
    return watchlist

# --- Endpoint to Add Stock to Watchlist ---
@router.post("/", response_model=WatchlistItemPublic, status_code=status.HTTP_201_CREATED)
def add_stock_to_watchlist_endpoint(
    watchlist_item_create: WatchlistItemCreate,
    current_user_id: int = Depends(get_current_user_id), 
    session: Session = Depends(get_session)
):
    """
    Add a stock symbol to the authenticated user's watchlist.
    - Ensures the stock isn't already on the watchlist.
    """
    # Check if item already exists for this user
    existing_item = crud_watchlists.get_watchlist_item_by_symbol_and_user(
        session, symbol=watchlist_item_create.symbol, user_id=current_user_id
    )
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Stock '{watchlist_item_create.symbol}' already in watchlist."
        )

    # Add stock to the watchlist
    new_item = crud_watchlists.add_stock_to_watchlist(
        session, watchlist_item_create=watchlist_item_create, user_id=current_user_id
    )
    return new_item

# --- Endpoint to Remove Stock from Watchlist ---
@router.delete("/{symbol}", status_code=status.HTTP_204_NO_CONTENT) # 204 No Content for successful deletion
def remove_stock_from_watchlist_endpoint(
    symbol: str, 
    current_user_id: int = Depends(get_current_user_id), 
    session: Session = Depends(get_session)
):
    """
    Remove a stock symbol from the authenticated user's watchlist.
    """
    item_to_delete = crud_watchlists.get_watchlist_item_by_symbol_and_user(
        session, symbol=symbol, user_id=current_user_id
    )
    if not item_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock '{symbol}' not found in watchlist or does not belong to user."
        )

    crud_watchlists.remove_stock_from_watchlist(session, watchlist_item=item_to_delete)
    return 
