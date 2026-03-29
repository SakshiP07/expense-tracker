# Expense Tracker

A personal expense tracker with Google Sign-In, built with FastAPI + PostgreSQL (backend) and React (frontend).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI 0.115 |
| Database | PostgreSQL + SQLAlchemy ORM + Alembic |
| Auth | Google OAuth 2.0 + JWT (HS256) |
| Frontend | React 18, Vite, React Router v6 |
| HTTP Client | Axios with JWT interceptor |
| Testing | pytest, 93%+ coverage |

---

## Features

- Google Sign-In only — no email/password
- Add expenses with multiple line items (subject + amount)
- Total auto-calculates live as items are added
- Each user sees only their own data
- Edit any expense — items recalculate total automatically
- Delete with confirmation

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

---

## Google OAuth Setup (do this once)

1. Go to https://console.cloud.google.com
2. Create project → APIs & Services → Credentials
3. Create Credentials → OAuth 2.0 Client ID → Web application
4. Add `http://localhost:5173` to **Authorized JavaScript origins**
5. Add `http://localhost:8000` to **Authorized redirect URIs**
6. Copy the Client ID and Client Secret

---

## Backend Setup
```bash
# 1. Create the database
psql -U your_username -d postgres -c "CREATE DATABASE expense_tracker;"

# 2. Copy and fill in .env
cd Backend
cp .env.example .env
# Edit .env — fill in DATABASE_URL and GOOGLE_CLIENT_ID

# 3. Create virtual environment
python -m venv venv
source venv/bin/activate      # Mac/Linux
# venv\Scripts\activate       # Windows

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run migrations
alembic upgrade head

# 6. Start the server
uvicorn main:app --reload
# Runs at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Backend `.env` values
```env
DATABASE_URL=postgresql://your_mac_username@localhost:5432/expense_tracker
JWT_SECRET_KEY=run: python -c "import secrets; print(secrets.token_hex(32))"
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

---

## Frontend Setup
```bash
# 1. Copy and fill in .env
cd Frontend
cp .env.example .env
# Edit .env — fill in VITE_GOOGLE_CLIENT_ID

# 2. Install packages
npm install

# 3. Start dev server
npm run dev
# Runs at http://localhost:5173
```

### Frontend `.env` values
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Manual Login (for development without Google OAuth)

If Google Sign-In is not working locally, insert a test user directly:
```bash
cd Backend
source venv/bin/activate
python test_user.py
```

Then copy the printed token and paste into your browser console:
```js
localStorage.setItem("token", "PASTE_TOKEN_HERE")
localStorage.setItem("user", '{"id":"test_user_001","email":"sakshi.pokhriyal007@gmail.com","name":"Sakshi","picture":""}')
```

Refresh the page — you will be logged in.

---

## Running Tests
```bash
cd Backend
source venv/bin/activate

# Run all tests
pytest test/ -v

# With coverage
pytest test/ --cov=app --cov-report=term-missing
```

---

## API Reference

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /auth/google | No | Exchange Google token for JWT |
| GET | /auth/me | Yes | Get current user profile |
| POST | /expenses | Yes | Create expense with items |
| GET | /expenses | Yes | List all expenses for logged-in user |
| GET | /expenses/{id} | Yes | Get single expense |
| PATCH | /expenses/{id} | Yes | Update expense, recalculates total |
| DELETE | /expenses/{id} | Yes | Delete expense |
| GET | /health | No | Health check |

---

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR PK | Google user ID |
| email | VARCHAR unique | From Google |
| name | VARCHAR | From Google |
| picture | VARCHAR nullable | Profile photo URL |
| created_at | TIMESTAMPTZ | Auto-set |

### expenses
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR PK | UUID |
| user_id | VARCHAR FK | References users.id |
| category | VARCHAR | Students / Office... / Housewives |
| date | DATE | Date of expense |
| description | TEXT nullable | Optional note |
| items | JSON | [{subject, amount}, ...] |
| total | FLOAT | Sum of all item amounts |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto on PATCH |

---

## Folder Structure
```
Expense Tracker/
├── Backend/
│   ├── app/
│   │   ├── controller/        # Business logic
│   │   ├── middleware/        # JWT verification
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── routes/            # FastAPI route handlers
│   │   ├── schema/            # Pydantic validation
│   │   └── utils/             # Database session
│   ├── alembic/               # DB migrations
│   ├── test/                  # pytest suite
│   ├── main.py                # App entry point
│   ├── config.py              # All env variables
│   ├── test_user.py           # Manual login script
│   ├── requirements.txt
│   ├── .env                   # Never commit
│   └── .env.example
│
└── Frontend/
    ├── src/
    │   ├── components/        # Layout, ExpenseForm
    │   ├── context/           # AuthContext
    │   ├── pages/             # Login, Dashboard, Add, Edit
    │   └── utils/             # Axios instance
    ├── index.html
    ├── vite.config.js
    ├── .env                   # Never commit
    └── .env.example
```

---

## Common Errors

| Error | Fix |
|-------|-----|
| `role "postgres" does not exist` | Use your Mac username: `psql -U your_mac_username` |
| `ALLOWED_ORIGINS` JSON parse error | Wrap in brackets: `["http://localhost:5173"]` |
| Extra inputs not permitted | Add `extra = "ignore"` to `Settings.Config` in `config.py` |
| `expenses` table does not exist | Run `alembic upgrade head` |
| CORS error in browser | Check `ALLOWED_ORIGINS` in `Backend/.env` |
| 401 on all requests | Check `GOOGLE_CLIENT_ID` matches in both `.env` files |
| Google button not showing | Check `VITE_GOOGLE_CLIENT_ID` in `Frontend/.env` |
```

---

## Where to put the README
```
Expense Tracker/
├── README.md        ← put it here at the root
├── Backend/
└── Frontend/