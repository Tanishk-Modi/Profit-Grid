from fastapi import APIRouter, HTTPException, status
from services import fmp_service
from services.indicator_calculator import calculate_sma
import requests
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/stock/{symbol}")
def get_stock(symbol: str):
    try:
        logger.info(f"Fetching stock data for {symbol}")
        data = fmp_service.fetch_global_quote(symbol)

        # Check for error messages first
        if "Error Message" in data:
            logger.error(f"FMP service error for {symbol}: {data['Error Message']}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=data['Error Message']
            )

        # Check if we have the expected Global Quote structure
        if "Global Quote" in data:
            quote = data["Global Quote"]
            logger.info(f"Successfully processed stock data for {symbol}")
            
            return {
                "symbol": quote.get("01. symbol", symbol),
                "price": float(quote.get("05. price", 0)),
                "change": str(quote.get("09. change", "0")),
                "change_percent": quote.get("10. change percent", "0%"),
                "last_updated": quote.get("07. latest trading day", "Unknown"),
                "open_price": float(quote.get("02. open", 0)),
                "high": float(quote.get("03. high", 0)),
                "low": float(quote.get("04. low", 0)),
                "volume": int(quote.get("06. volume", 0)),
                "previous_close": float(quote.get("08. previous close", 0))
            }
        else:
            logger.error(f"Unexpected data structure for {symbol}: {list(data.keys()) if isinstance(data, dict) else type(data)}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Could not get data for {symbol}. Unexpected FMP API response structure."
            )

    except HTTPException:
        # Re-raise HTTPExceptions (our custom errors)
        raise
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception for {symbol}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"External API request failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error for {symbol}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unhandled error occurred: {str(e)}"
        )

@router.get("/price/{symbol}")
def get_price_history(symbol: str, days: int = 30):
    """
    Get daily price history
    """
    try:
        logger.info(f"Fetching price history for {symbol} ({days} days)")
        data = fmp_service.fetch_daily_time_series(symbol)

        # Check for error messages first
        if "Error Message" in data:
            logger.error(f"FMP service error for historical data {symbol}: {data['Error Message']}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=data['Error Message']
            )

        # Check if we have the expected Time Series structure
        if "Time Series (Daily)" in data:
            historical_data_list = data["Time Series (Daily)"]
            logger.info(f"Processing {len(historical_data_list)} days of historical data for {symbol}")

            prices = []
            # Take only the requested number of days
            for item_dict in historical_data_list[:days]:
                if isinstance(item_dict, dict):
                    # Check if all required fields are present
                    required_fields = ["date", "close", "volume", "high", "low"]
                    if all(field in item_dict for field in required_fields):
                        try:
                            prices.append({
                                "date": item_dict["date"],
                                "close": float(item_dict["close"]),
                                "volume": int(item_dict["volume"]),
                                "high": float(item_dict["high"]),
                                "low": float(item_dict["low"])
                            })
                        except (ValueError, TypeError) as e:
                            logger.warning(f"Error converting data types for {symbol} on {item_dict.get('date', 'unknown')}: {e}")
                            continue
                    else:
                        logger.warning(f"Missing required fields in historical data for {symbol}: {item_dict}")
                        continue
                else:
                    logger.warning(f"Invalid historical data item for {symbol}: {item_dict}")
                    continue

            # Reverse to get chronological order (oldest to newest)
            prices.reverse()

            logger.info(f"Successfully processed {len(prices)} days of price history for {symbol}")
            return {
                "symbol": symbol,
                "days_requested": days,
                "days_returned": len(prices),
                "prices": prices
            }
        else:
            logger.error(f"Unexpected historical data structure for {symbol}: {list(data.keys()) if isinstance(data, dict) else type(data)}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Could not get price history for {symbol}. No daily time series found or unexpected structure."
            )

    except HTTPException:
        # Re-raise HTTPExceptions (our custom errors)
        raise
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception for historical data {symbol}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"External API request failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error for historical data {symbol}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unhandled error occurred in price history: {str(e)}"
        )