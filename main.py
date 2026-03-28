# main.py
# Entry point — will register routers in later commits.
# For now just confirms the app boots.

from fastapi import FastAPI

app = FastAPI(title="Expense Tracker API", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "ok"}