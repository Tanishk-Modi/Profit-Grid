from fastapi import FastAPI
import requests
import json
import os
import dotenv

app = FastAPI()

API_KEY = os.getenv("API_KEY")  

@app.get("/")
def hello():
    return {"message": "Hello! Your stock tracker is running with Alpha Vantage!"}

@app.get("/stock/{symbol}")
def get_stock(symbol: str):
    try:
        # Alpha Vantage API URL
        url = f"https://www.alphavantage.co/query"
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": API_KEY
        }
        
        # Make the API request
        response = requests.get(url, params=params)
        data = response.json()
        
        # Check if we got valid data
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
            # Handle API limit or invalid symbol
            return {
                "error": f"Could not get data for {symbol}",
                "details": data.get("Note", "Unknown error"),
            }
            
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}

@app.get("/price/{symbol}")
def get_price_history(symbol: str, days: int = 30):
    """
    Get daily price history
    """
    try:
        url = f"https://www.alphavantage.co/query"
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "apikey": API_KEY
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
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
            return {
                "error": f"Could not get price history for {symbol}",
                "details": data.get("Note", "Unknown error"),
                "tip": "Get your free API key at alphavantage.co for full access"
            }
            
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}

def calculate_sma(prices: list, period: int) -> list:

    sma_values = []
    for i in range(len(prices)):
        if i + 1 >= period:
            recent_prices = prices[i + 1 - period:i + 1]
            average = sum(recent_prices) / period
            sma_values.append(round(average, 2))
        else:
            sma_values.append(None)
    
    return sma_values

@app.get("/sma/{symbol}")
def get_sma(symbol: str, period: int = 20, days: int = 50):
    try:
        url = f"https://www.alphavantage.co/query"
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "apikey": API_KEY
        }

        response = requests.get(url, params=params)
        data = response.json()

        if ("Time Series (Daily)" in data):
            time_series = data["Time Series (Daily)"]

            dates = sorted(time_series.keys())[-days:]
            prices = []

            for date in dates:
                prices.append(float(time_series[date]["4. close"]))

        # Calculate SMA
        sma_values = calculate_sma(prices, period)

        # Combine dates, prices, and SMA
        result = []
        for i, date in enumerate(dates):
            result.append({
                "date": date,
                "price": prices[i],
                "sma": sma_values[i]
            })
            
            return {
                "symbol": symbol,
                "period": period,
                "data": result[-20:],  # Return last 20 days
                "explanation": f"SMA{period} = average of last {period} closing prices"
            }
        else:
            return {
                "error": f"Could not get data for {symbol}",
                "details": data.get("Note", "Unknown error")
            }
            
    except Exception as e:
        return {"error": f"Calculation failed: {str(e)}"}