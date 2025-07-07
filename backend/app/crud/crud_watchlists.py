from sqlmodel import Session, select
from app.models import WatchlistItem, User 
from app.schemas.user_schemas import WatchlistItemCreate 

def get_watchlist_item_by_symbol_and_user(
    session: Session,
    symbol: str,
    user_id: int
) -> WatchlistItem | None:
    """
    Retrieves a specific watchlist item by symbol and user ID.
    """
    item = session.exec(
        select(WatchlistItem)
        .where(WatchlistItem.symbol == symbol)
        .where(WatchlistItem.user_id == user_id)
    ).first()
    return item

def get_watchlist_by_user(session: Session, user_id: int) -> list[WatchlistItem]:
    """
    Retrieves all watchlist items for a given user.
    """
    items = session.exec(
        select(WatchlistItem)
        .where(WatchlistItem.user_id == user_id)
    ).all()
    return items

def add_stock_to_watchlist(
    session: Session,
    watchlist_item_create: WatchlistItemCreate,
    user_id: int
) -> WatchlistItem:
    """
    Adds a new stock symbol to a user's watchlist.
    """
    watchlist_item_to_db = WatchlistItem(
        symbol=watchlist_item_create.symbol,
        user_id=user_id
    )

    session.add(watchlist_item_to_db)
    session.commit()
    session.refresh(watchlist_item_to_db) # Refresh to get the generated ID from the DB

    return watchlist_item_to_db

def remove_stock_from_watchlist(
    session: Session,
    watchlist_item: WatchlistItem
):
    """
    Removes a stock symbol from a user's watchlist.
    """
    session.delete(watchlist_item)
    session.commit()
    return {"message": "Item removed successfully"} 
