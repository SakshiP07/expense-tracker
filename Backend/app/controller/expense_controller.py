# app/controller/expense_controller.py
# All expense business logic.
#
# Key security rule enforced here:
# Every DB query filters by BOTH the expense ID AND the user_id.
# This prevents IDOR (Insecure Direct Object Reference) —
# user B cannot read/edit/delete user A's expense even if they know the ID.

from typing import Optional, List
from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schema.expense import ExpenseCreate, ExpenseUpdate


def _compute_total(items: list) -> float:
    """Sum amounts across all line items. Round to 2 decimal places."""
    return round(sum(item["amount"] for item in items), 2)


def _get_from_date(date_filter: Optional[str]) -> Optional[date]:
    """
    Convert the ?date= query param string into a cutoff date.
    recent / 1week → 7 days ago
    1month         → 30 days ago
    1year          → 365 days ago
    None / 'all'   → no date filter
    """
    today = date.today()
    mapping = {
        "recent": today - timedelta(days=7),
        "1week":  today - timedelta(days=7),
        "1month": today - timedelta(days=30),
        "1year":  today - timedelta(days=365),
    }
    return mapping.get(date_filter) if date_filter else None


def _get_or_404(expense_id: str, user_id: str, db: Session) -> Expense:
    """
    Fetch expense by ID that belongs to this user.
    Returns 404 (not 403) even if the expense exists but belongs to another user.
    Why 404 and not 403?
    → 403 reveals that the record EXISTS. 404 leaks nothing.
    """
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return expense


def create_expense(payload: ExpenseCreate, user_id: str, db: Session) -> Expense:
    items_data = [item.model_dump() for item in payload.items]

    expense = Expense(
        user_id=user_id,                    # always from the JWT — client cannot forge this
        category=payload.category.value,
        date=payload.date,
        description=payload.description,
        items=items_data,
        total=_compute_total(items_data),
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def list_expenses(
    user_id: str,
    db: Session,
    date_filter: Optional[str] = None,
    category: Optional[str] = None,
) -> List[Expense]:
    # Always start with user_id filter — non-negotiable
    query = db.query(Expense).filter(Expense.user_id == user_id)

    from_date = _get_from_date(date_filter)
    if from_date:
        query = query.filter(Expense.date >= from_date)

    if category and category != "all":
        query = query.filter(Expense.category == category)

    # Most recent first
    return query.order_by(Expense.date.desc(), Expense.created_at.desc()).all()


def get_expense(expense_id: str, user_id: str, db: Session) -> Expense:
    return _get_or_404(expense_id, user_id, db)


def update_expense(
    expense_id: str, payload: ExpenseUpdate, user_id: str, db: Session
) -> Expense:
    expense = _get_or_404(expense_id, user_id, db)

    if payload.category is not None:
        expense.category = payload.category.value
    if payload.date is not None:
        expense.date = payload.date
    if payload.description is not None:
        expense.description = payload.description
    if payload.items is not None:
        items_data = [item.model_dump() for item in payload.items]
        expense.items = items_data
        expense.total = _compute_total(items_data)   # recalculate total

    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(expense_id: str, user_id: str, db: Session) -> None:
    expense = _get_or_404(expense_id, user_id, db)
    db.delete(expense)
    db.commit()