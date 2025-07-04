from fastapi import APIRouter, HTTPException
from services import alpha_vantage_service
from services.indicator_calculator import calculate_sma
import requests

router = APIRouter() # Define an API Router

@router.get("/stock/{symbol}")
def get_stock(symbol: str):
    try:
        # Use the service function to fetch data
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
            raise HTTPException(status_code=404, detail=data.get("Note", f"Could not get data for {symbol}"))

    except requests.exceptions.RequestException as e: # Catch request-specific errors
        raise HTTPException(status_code=500, detail=f"External API request failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")


@router.get("/price/{symbol}")
def get_price_history(symbol: str, days: int = 30):
    try:
        # Use the service function
        data = alpha_vantage_service.fetch_daily_time_series(symbol)

        if "Time Series (Daily)" in data:
            time_series = data["Time Series (Daily)"]
            prices = []
            for date, values in list(time_series.items())[:days]:
                prices.append({
                    "date": date,
                    "close": float(values["4. close"]),
                    "volume": int(values["5. volume"]),
                    "high": float(values["2. high"]),
                    "low": float(values["3. low"])
                })
            return {
                "symbol": symbol,
                "days_requested": days,
                "days_returned": len(prices),
                "prices": prices
            }
        else:
            raise HTTPException(status_code=404, detail=data.get("Note", f"Could not get price history for {symbol}"))

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"External API request failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")


@router.get("/sma/{symbol}")
def get_sma(symbol: str, period: int = 20, days: int = 50):
    try:
        # Use the service function
        data = alpha_vantage_service.fetch_daily_time_series(symbol)

        if "Time Series (Daily)" in data:
            time_series = data["Time Series (Daily)"]
            dates = sorted(time_series.keys(), reverse=True)[:days] # Get most recent 'days'
            prices_for_sma = []
            for date in dates:
                prices_for_sma.append(float(time_series[date]["4. close"]))

            # Ensure prices are in chronological order for SMA calculation if needed,
            # though current calculate_sma assumes order based on slicing
            prices_for_sma.reverse() # SMA needs oldest to newest

            # Calculate SMA using the imported function
            sma_values = calculate_sma(prices_for_sma, period)

            # Combine dates, prices, and SMA
            result = []
            # Ensure dates and sma_values align correctly after reversing
            for i in range(len(dates)):
                result.append({
                    "date": dates[len(dates) - 1 - i], # Adjust date index back to match sma_values
                    "price": prices_for_sma[i],
                    "sma": sma_values[i]
                })

            return {
                "symbol": symbol,
                "period": period,
                "data": result[-20:],  # Return last 20 days, adjusted for potential 'None' values
                "explanation": f"SMA{period} = average of last {period} closing prices"
            }
        else:
            raise HTTPException(status_code=404, detail=data.get("Note", f"Could not get data for {symbol}"))

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"External API request failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")