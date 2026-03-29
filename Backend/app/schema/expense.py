# app/schema/expense.py
# Pydantic models for expense CRUD.
#
# ExpenseItem     → one line item (subject + amount)
# ExpenseCreate   → full payload to create an expense
# ExpenseUpdate   → partial update (all fields optional = PATCH semantics)
# ExpenseResponse → what we send back to the client

from pydantic import BaseModel, field_validator, ConfigDict
from typing import Annotated, Optional, List
from datetime import datetime, date
from enum import Enum


class CategoryEnum(str, Enum):
    # str mixin makes the enum JSON-serializable
    STUDENTS = "Students"
    OFFICE   = "Office/Shopkeepers/Freelancer"
    HOUSEWIVES = "Housewives"


class ExpenseItem(BaseModel):
    subject: str
    amount: float

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
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
    description: str = None
    items: List[ExpenseItem]

    @field_validator("items")
    @classmethod
    def at_least_one(cls, v: List[ExpenseItem]) -> List[ExpenseItem]:
        if not v:
            raise ValueError("Add at least one item")
        return v


class ExpenseUpdate(BaseModel):
    # All fields optional → supports partial PATCH
    category: Optional[CategoryEnum] = None
    date: Annotated[Optional[date], Field(default=None)]
    description: str = None
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
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

ExpenseResponse.model_rebuild()