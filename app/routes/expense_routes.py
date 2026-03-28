# app/routes/expense_routes.py
# REST endpoints for expenses. All routes require a valid JWT.
#
# GET  /expenses          → list with optional ?date= and ?category= filters
# POST /expenses          → create
# GET  /expenses/{id}     → get single
# PATCH /expenses/{id}    → partial update
# DELETE /expenses/{id}   → delete

from typing import Optional, List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.controller import expense_controller
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schema.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.utils.database import get_db

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    payload: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_controller.create_expense(payload, current_user.id, db)


@router.get("", response_model=List[ExpenseResponse])
async def list_expenses(
    date_filter: Optional[str] = Query(None, alias="date"),
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Optional filters:
    ?date=recent|1week|1month|1year
    ?category=Students|Office/Shopkeepers/Freelancer|Housewives
    """
    return expense_controller.list_expenses(current_user.id, db, date_filter, category)


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_controller.get_expense(expense_id, current_user.id, db)


@router.patch("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    payload: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_controller.update_expense(expense_id, payload, current_user.id, db)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense_controller.delete_expense(expense_id, current_user.id, db)