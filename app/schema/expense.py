# app/schema/expense.py
# Pydantic models = the contract between client and API.
# FastAPI auto-validates incoming data and auto-serializes responses.

from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional, List
from datetime import date
from enum import Enum


class CategoryEnum(str, Enum):
    STUDENTS = "Students"
    OFFICE = "Office/Shopkeepers/Freelancer"
    HOUSEWIVES = "Housewives"


class ExpenseItem(BaseModel):
    """A single line item inside an expense."""
    subject: str          # e.g. "Notebook", "Lunch", "Electricity bill"
    amount: float         # e.g. 250.00

    @field_validator("amount")
    @classmethod
    def must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return round(v, 2)

    @field_validator("subject")
    @classmethod
    def subject_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Subject cannot be empty")
        return v.strip()


class ExpenseCreate(BaseModel):
    category: CategoryEnum
    date: date
    description: Optional[str] = None
    items: List[ExpenseItem]  # at least one item required

    @field_validator("items")
    @classmethod
    def at_least_one_item(cls, v: List[ExpenseItem]) -> List[ExpenseItem]:
        if not v:
            raise ValueError("Add at least one item")
        return v


class ExpenseUpdate(BaseModel):
    category: Optional[CategoryEnum] = None
    date: Optional[date] = None
    description: Optional[str] = None
    items: Optional[List[ExpenseItem]] = None


class ExpenseItemResponse(BaseModel):
    subject: str
    amount: float


class ExpenseResponse(BaseModel):
    id: str
    category: str
    date: date
    description: Optional[str] = None
    items: List[ExpenseItemResponse]
    total: float
    created_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)