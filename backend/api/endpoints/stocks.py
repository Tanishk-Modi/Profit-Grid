from fastapi import APIRouter, HTTPException
from services import alpha_vantage_service
from services.indicator_calculator import calculate_sma
import requests

router = APIRouter()

@router.get("/stock/{symbol}")
def get_stock(symbol: str):
    try:
        data = alpha_vantage_service.fetch_global_quote(symbol)

        if "Note" in data:
            raise HTTPException(status_code=429, detail=f"Alpha Vantage API Limit Reached: {data['Note']}")
        if "Error Message" in data:
            raise HTTPException(status_code=400, detail=f"Alpha Vantage Error: {data['Error Message']}")

        if "Global Quote" in data:
            quote = data["Global Quote"]
            return {
                "symbol": quote.get("01. symbol", symbol),
                "price": float(quote.get("05. price", 0)),
                "change": quote.get("09. change", "0"),
                "change_percent": quote.get("10. change percent", "0%"),
                "last_updated": quote.get("07. latest trading day", "Unknown"),
                "open_price": float(quote.get("02. open", 0)),
                "high": float(quote.get("03. high", 0)),
                "low": float(quote.get("04. low", 0)),
                "volume": int(quote.get("06. volume", 0)),
                "previous_close": quote.get("08. previous close", 0)
            }
        else:
            raise HTTPException(status_code=404, detail=f"Could not get data for {symbol}. Unexpected API response.")

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"External API request failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

@router.get("/price/{symbol}")
def get_price_history(symbol: str, days: int = 30):
    """
    Get daily price history
    """
    try:
        data = alpha_vantage_service.fetch_daily_time_series(symbol)

        if "Note" in data:
            raise HTTPException(status_code=429, detail=f"Alpha Vantage API Limit Reached or invalid request: {data['Note']}")
        if "Error Message" in data:
            raise HTTPException(status_code=400, detail=f"Alpha Vantage Error: {data['Error Message']}")

        if "Time Series (Daily)" in data:
            time_series = data["Time Series (Daily)"]

            prices = []
            sorted_dates = sorted(time_series.keys(), reverse=True)
            for date in sorted_dates[:days]:
                values = time_series[date]
                prices.append({
                    "date": date,
                    "close": float(values["4. close"]),
                    "volume": int(values["5. volume"]),
                    "high": float(values["2. high"]),
                    "low": float(values["3. low"])
                })

            prices.reverse()

            return {
                "symbol": symbol,
                "days_requested": days,
                "days_returned": len(prices),
                "prices": prices
            }
        else:
            raise HTTPException(
                status_code=404,
                detail=data.get("Note", f"Could not get price history for {symbol}. No daily time series found.")
            )

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"External API request failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")