from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv
import os

load_dotenv()

from api.endpoints import stocks

app = FastAPI()

@app.get("/")
def hello():
    return {"message": "Hello! Your stock tracker is running with Alpha Vantage!"}

app.include_router(stocks.router, prefix="/api/v1")

if __name__ == "__main__":
    # dotenv.load_dotenv() # Load .env variables if not already handled
    uvicorn.run(app, host="0.0.0.0", port=8000)