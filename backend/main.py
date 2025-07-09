from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import stocks
from app.database import create_db_and_tables
from api.endpoints import users
from api.endpoints import watchlists
import os

app = FastAPI()

origins = [
    "http://localhost:5173",  
    "http://127.0.0.1:5173",
    "https://profit-grid.vercel.app/",
    "https://profit-grid-git-main-tanishk-modis-projects.vercel.app",
    "https://profit-grid-ui69kmhu1-tanishk-modis-projects.vercel.app"  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

@app.on_event("startup") 
def on_startup():
    create_db_and_tables()

@app.get("/")
def hello():
    return {"message": "Hello! Your stock analysis tool is running with Alpha Vantage!"}

app.include_router(stocks.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1/users")
app.include_router(watchlists.router, prefix="/api/v1/watchlists")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)