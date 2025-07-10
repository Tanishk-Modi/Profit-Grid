import requests
import os
import time
import datetime

# --- CACHING SETUP ---
_api_cache = {}
CACHE_TTL_SECONDS = 300  # 5 minutes
FMP_BASE_URL = "https://financialmodelingprep.com/api/v3"

def _is_cache_valid(cache_entry: dict) -> bool:
    if not cache_entry:
        return False
    return (time.time() - cache_entry["timestamp"]) < CACHE_TTL_SECONDS

FMP_API_KEY = os.getenv("FMP_API_KEY")

if not FMP_API_KEY:
    raise ValueError("FMP_API_KEY not found in environment variables. Please set it in your .env file.")

def _add_api_key_to_url(url: str) -> str:
    """Adds the FMP API key as a query parameter, handling existing parameters."""
    if "?" in url:
        return f"{url}&apikey={FMP_API_KEY}"
    else:
        return f"{url}?apikey={FMP_API_KEY}"

def _check_fmp_rate_limit(data):
    """Check if the response indicates a rate limit has been hit."""
    if isinstance(data, dict):
        if "Error Message" in data:
            error_msg = data["Error Message"].lower()
            if "limit" in error_msg or "exceeded" in error_msg or "upgrade" in error_msg:
                return True
        
        if "message" in data:
            msg = data["message"].lower()
            if "limit" in msg or "exceeded" in msg or "upgrade" in msg:
                return True
    
    if isinstance(data, list) and len(data) == 0: # FMP sometimes returns empty list on rate limit
        return True
    
    return False

def fetch_global_quote(symbol: str):
    cache_key = ("FMP_QUOTE", symbol)

    cached_data = _api_cache.get(cache_key)
    if cached_data and _is_cache_valid(cached_data):
        return cached_data["data"]
    
    try:
        url = f"{FMP_BASE_URL}/quote/{symbol}"
        full_url = _add_api_key_to_url(url)
        
        response = requests.get(full_url)
        response.raise_for_status()
        data = response.json()
        
        if _check_fmp_rate_limit(data):
            return {"Error Message": "FMP API rate limit reached. Please try again later."}
        
        if not data or not isinstance(data, list) or len(data) == 0:
            return {"Error Message": f"No quote data found for {symbol}"}

        quote_data = data[0]
        
        if not quote_data or "symbol" not in quote_data:
            return {"Error Message": f"Invalid data structure returned for {symbol}"}

        # Format the timestamp to a readable date
        raw_timestamp = quote_data.get("timestamp", None)
        if raw_timestamp:
            try:
                last_updated = datetime.datetime.utcfromtimestamp(int(raw_timestamp)).strftime('%Y-%m-%d %H:%M:%S UTC')
            except Exception:
                last_updated = str(raw_timestamp)
        else:
            last_updated = "Unknown"

        # Round change percent to two decimals
        changes_percentage = quote_data.get('changesPercentage', 0)
        try:
            changes_percentage = round(float(changes_percentage), 2)
        except Exception:
            changes_percentage = 0.0

        # Create the formatted response that matches what the router expects
        formatted_response = {
            "Global Quote": {
                "01. symbol": quote_data.get("symbol", symbol),
                "05. price": str(quote_data.get("price", 0)),
                "09. change": str(quote_data.get("change", 0)),
                "10. change percent": f"{changes_percentage}%",
                "07. latest trading day": last_updated,
                "02. open": str(quote_data.get("open", 0)),
                "03. high": str(quote_data.get("dayHigh", 0)),
                "04. low": str(quote_data.get("dayLow", 0)),
                "06. volume": str(quote_data.get("volume", 0)),
                "08. previous close": str(quote_data.get("previousClose", 0))
            }
        }

        # Cache the formatted response
        _api_cache[cache_key] = {"data": formatted_response, "timestamp": time.time()}
        
        return formatted_response

    except requests.exceptions.RequestException as e:
        return {"Error Message": f"Failed to fetch data for {symbol}: {str(e)}"}
    except Exception as e:
        return {"Error Message": f"Unexpected error fetching data for {symbol}: {str(e)}"}

def fetch_daily_time_series(symbol: str):
    cache_key = ("FMP_HISTORICAL_DAILY", symbol)

    cached_data = _api_cache.get(cache_key)
    if cached_data and _is_cache_valid(cached_data):
        return cached_data["data"]
    
    try:
        url = f"{FMP_BASE_URL}/historical-price-full/{symbol}"
        full_url = _add_api_key_to_url(url)
        
        response = requests.get(full_url)
        response.raise_for_status()
        data = response.json()
        
        if _check_fmp_rate_limit(data):
            return {"Error Message": "FMP API rate limit reached. Please try again later."}

        if not data or "historical" not in data or not isinstance(data["historical"], list):
            return {"Error Message": f"No historical data found for {symbol}"}

        historical_data = data["historical"]
        
        if not historical_data:
            return {"Error Message": f"No historical data available for {symbol}"}

        # Convert FMP format to the format expected by the router
        formatted_historical = []
        for day_data in historical_data:
            formatted_day = {
                "date": day_data.get("date", ""),
                "close": str(day_data.get("close", 0)),
                "volume": str(day_data.get("volume", 0)),
                "high": str(day_data.get("high", 0)),
                "low": str(day_data.get("low", 0)),
                "open": str(day_data.get("open", 0))
            }
            formatted_historical.append(formatted_day)

        formatted_response = {"Time Series (Daily)": formatted_historical}

        # Cache the formatted response
        _api_cache[cache_key] = {"data": formatted_response, "timestamp": time.time()}
        
        return formatted_response

    except requests.exceptions.RequestException as e:
        return {"Error Message": f"Failed to fetch historical data for {symbol}: {str(e)}"}
    except Exception as e:
        return {"Error Message": f"Unexpected error fetching historical data for {symbol}: {str(e)}"}

def fetch_company_profile(symbol: str):
    cache_key = ("FMP_COMPANY_PROFILE", symbol)

    cached_data = _api_cache.get(cache_key)
    if cached_data and _is_cache_valid(cached_data):
        return cached_data["data"]
    
    try:
        url = f"{FMP_BASE_URL}/profile/{symbol}"
        full_url = _add_api_key_to_url(url)
        
        response = requests.get(full_url)
        response.raise_for_status()
        data = response.json()
        
        if _check_fmp_rate_limit(data):
            return {"Error Message": "FMP API rate limit reached. Please try again later."}

        if not data or not isinstance(data, list) or len(data) == 0:
            return {"Error Message": f"No company profile data found for {symbol}"}

        profile_data = data[0]
        
        if not profile_data or "symbol" not in profile_data:
            return {"Error Message": f"Invalid data structure returned for {symbol} profile"}

        formatted_response = {
            "Company Profile": {
                "Symbol": profile_data.get("symbol", symbol),
                "Company Name": profile_data.get("companyName", "N/A"),
                "Exchange": profile_data.get("exchange", "N/A"),
                "Industry": profile_data.get("industry", "N/A"),
                "Sector": profile_data.get("sector", "N/A"),
                "CEO": profile_data.get("ceo", "N/A"),
                "Website": profile_data.get("website", "N/A"),
                "Description": profile_data.get("description", "N/A"),
                "Full Time Employees": profile_data.get("fullTimeEmployees", "N/A"),
                "Country": profile_data.get("country", "N/A"),
                "IPODate": profile_data.get("ipoDate", "N/A"),
                "Market Cap": profile_data.get("mktCap", "N/A")
            }
        }

        _api_cache[cache_key] = {"data": formatted_response, "timestamp": time.time()}
        
        return formatted_response

    except requests.exceptions.RequestException as e:
        return {"Error Message": f"Failed to fetch company profile for {symbol}: {str(e)}"}
    except Exception as e:
        return {"Error Message": f"Unexpected error fetching company profile for {symbol}: {str(e)}"}