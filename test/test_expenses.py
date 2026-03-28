# test/test_expenses.py
# Full pytest test suite.
#
# Uses SQLite in-memory DB → no PostgreSQL needed to run tests.
# Mocks Google token verification → no real Google API calls.
#
# Run with:
#   pytest test/ -v
#   pytest test/ --cov=app --cov-report=term-missing

import pytest
from datetime import date, datetime, timedelta, timezone
from unittest.mock import patch

import jwt
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from config import settings
from app.utils.database import Base, get_db
from app.models.user import User
from app.models.expense import Expense
from app.middleware.auth import create_access_token

# ── Test DB setup ──────────────────────────────────────────────────────────
TEST_DB_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


# ── Helper fixtures ────────────────────────────────────────────────────────
@pytest.fixture
def user_a():
    db = TestSession()
    u = User(id="google_a", email="a@test.com", name="User A", picture="")
    db.add(u); db.commit(); db.refresh(u); db.close()
    return u


@pytest.fixture
def user_b():
    db = TestSession()
    u = User(id="google_b", email="b@test.com", name="User B", picture="")
    db.add(u); db.commit(); db.refresh(u); db.close()
    return u


@pytest.fixture
def token_a(user_a):
    return create_access_token(user_a.id)


@pytest.fixture
def token_b(user_b):
    return create_access_token(user_b.id)


def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ── A. Google Sign-In ──────────────────────────────────────────────────────
class TestGoogleAuth:

    def test_new_user_created_on_first_login(self, client):
        mock = {"sub": "g_new", "email": "new@gmail.com", "name": "New", "picture": ""}
        with patch("app.middleware.auth.id_token.verify_oauth2_token", return_value=mock):
            res = client.post("/auth/google", json={"token": "fake"})
        assert res.status_code == 200
        assert "access_token" in res.json()
        assert res.json()["user"]["email"] == "new@gmail.com"

    def test_returning_user_gets_new_token(self, client, user_a):
        mock = {"sub": user_a.id, "email": user_a.email, "name": user_a.name, "picture": ""}
        with patch("app.middleware.auth.id_token.verify_oauth2_token", return_value=mock):
            res = client.post("/auth/google", json={"token": "fake"})
        assert res.status_code == 200
        assert res.json()["user"]["id"] == user_a.id

    def test_invalid_google_token_returns_401(self, client):
        with patch("app.middleware.auth.id_token.verify_oauth2_token",
                   side_effect=ValueError("bad token")):
            res = client.post("/auth/google", json={"token": "bad"})
        assert res.status_code == 401

    def test_get_me_returns_user(self, client, user_a, token_a):
        res = client.get("/auth/me", headers=auth(token_a))
        assert res.status_code == 200
        assert res.json()["email"] == user_a.email

    def test_expired_token_returns_401(self, client, user_a):
        expired = jwt.encode(
            {"sub": user_a.id, "exp": datetime.now(timezone.utc) - timedelta(hours=1)},
            settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
        )
        res = client.get("/auth/me", headers=auth(expired))
        assert res.status_code == 401


# ── B. Expense CRUD ────────────────────────────────────────────────────────
class TestExpenseCRUD:

    def test_create_expense(self, client, token_a):
        res = client.post("/expenses",
            json={"category": "Students", "date": "2024-03-01",
                  "items": [{"subject": "Notebook", "amount": 50}]},
            headers=auth(token_a))
        assert res.status_code == 201
        assert res.json()["total"] == 50.0

    def test_list_expenses(self, client, user_a, token_a):
        db = TestSession()
        db.add(Expense(user_id=user_a.id, category="Students",
                       date=date(2024, 1, 1), items=[{"subject": "Book", "amount": 100}], total=100))
        db.commit(); db.close()
        res = client.get("/expenses", headers=auth(token_a))
        assert len(res.json()) == 1

    def test_update_expense_recalculates_total(self, client, user_a, token_a):
        db = TestSession()
        e = Expense(user_id=user_a.id, category="Students",
                    date=date(2024, 1, 1), items=[{"subject": "Book", "amount": 100}], total=100)
        db.add(e); db.commit(); eid = e.id; db.close()

        res = client.patch(f"/expenses/{eid}",
            json={"items": [{"subject": "Book", "amount": 150}, {"subject": "Pen", "amount": 20}]},
            headers=auth(token_a))
        assert res.status_code == 200
        assert res.json()["total"] == 170.0

    def test_delete_expense(self, client, user_a, token_a):
        db = TestSession()
        e = Expense(user_id=user_a.id, category="Students",
                    date=date(2024, 1, 1), items=[{"subject": "X", "amount": 10}], total=10)
        db.add(e); db.commit(); eid = e.id; db.close()
        res = client.delete(f"/expenses/{eid}", headers=auth(token_a))
        assert res.status_code == 204


# ── C. Input Validation ────────────────────────────────────────────────────
class TestValidation:

    def test_negative_amount_rejected(self, client, token_a):
        res = client.post("/expenses",
            json={"category": "Students", "date": "2024-01-01",
                  "items": [{"subject": "X", "amount": -50}]},
            headers=auth(token_a))
        assert res.status_code == 422

    def test_empty_items_rejected(self, client, token_a):
        res = client.post("/expenses",
            json={"category": "Students", "date": "2024-01-01", "items": []},
            headers=auth(token_a))
        assert res.status_code == 422

    def test_invalid_category_rejected(self, client, token_a):
        res = client.post("/expenses",
            json={"category": "InvalidCat", "date": "2024-01-01",
                  "items": [{"subject": "X", "amount": 10}]},
            headers=auth(token_a))
        assert res.status_code == 422


# ── D. Authorization / Security ────────────────────────────────────────────
class TestAuthorization:

    def test_user_b_cannot_see_user_a_expenses(self, client, user_a, token_b):
        """CRITICAL: user isolation test"""
        db = TestSession()
        db.add(Expense(user_id=user_a.id, category="Students",
                       date=date(2024, 1, 1), items=[{"subject": "X", "amount": 99}], total=99))
        db.commit(); db.close()

        res = client.get("/expenses", headers=auth(token_b))
        assert res.json() == []   # user B sees nothing

    def test_user_b_cannot_delete_user_a_expense(self, client, user_a, token_b):
        db = TestSession()
        e = Expense(user_id=user_a.id, category="Students",
                    date=date(2024, 1, 1), items=[{"subject": "X", "amount": 99}], total=99)
        db.add(e); db.commit(); eid = e.id; db.close()

        res = client.delete(f"/expenses/{eid}", headers=auth(token_b))
        assert res.status_code == 404   # not 403 — avoids revealing the record exists

    def test_no_token_returns_403(self, client):
        res = client.get("/expenses")
        assert res.status_code == 403

