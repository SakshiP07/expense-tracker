# main.py
# Entry point — will register routers in later commits.
# For now just confirms the app boots.

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.utils.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()   # creates tables on first boot if they don't exist
    yield

app = FastAPI(title="Expense Tracker API", version="1.0.0", lifespan=lifespan)

@app.get("/health")
def health():
    return {"status": "ok"}