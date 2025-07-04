import requests
import os

API_KEY = os.getenv("API_KEY")

def fetch_global_quote(symbol: str):
    url = f"https://www.alphavantage.co/query"
    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": API_KEY
    }
    response = requests.get(url, params=params)
    response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
    return response.json()

def fetch_daily_time_series(symbol: str):
    url = f"https://www.alphavantage.co/query"
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": API_KEY
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()
