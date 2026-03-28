# Expense Tracker — Backend

FastAPI + PostgreSQL backend for the Personal Expense Tracker.

## Setup
```bash
cp .env.example .env
# Fill in DATABASE_URL and GOOGLE_CLIENT_ID

python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

psql -U postgres -c "CREATE DATABASE expense_tracker;"
uvicorn main:app --reload
```

## API Docs
Visit http://localhost:8000/docs

## Tests
```bash
pytest test/ -v --cov=app --cov-report=term-missing
```