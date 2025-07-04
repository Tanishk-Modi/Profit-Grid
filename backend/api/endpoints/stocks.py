from fastapi import APIRouter, HTTPException
from services import alpha_vantage_service
from services.indicator_calculator import calculate_sma
import requests 

router = APIRouter()

@router.get("/stock/{symbol}")
def get_stock(symbol: str):
    try:
        data = alpha_vantage_service.fetch_global_quote(symbol)

        if "Global Quote" in data:
            quote = data["Global Quote"]
            return {
                "symbol": quote.get("01. symbol", symbol),
                "price": float(quote.get("05. price", 0)),
                "change": quote.get("09. change", "0"),
                "change_percent": quote.get("10. change percent", "0%"),
                "last_updated": quote.get("07. latest trading day", "Unknown")
            }
        else:
            raise HTTPException(status_code=404, detail=f"Could not get data for {symbol}. Unexpected API response.")

    except requests.exceptions.RequestException as e:
        # Catch network/HTTP errors from requests library
        print(f"ERROR: RequestException caught in endpoint: {e}") # DEBUG
        raise HTTPException(status_code=500, detail=f"External API request failed: {str(e)}")
    except Exception as e:
        # Catch any other unexpected errors
        print(f"ERROR: Generic Exception caught in endpoint: {e}") # DEBUG
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")