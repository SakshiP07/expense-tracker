# app/models/expense.py
# The "expenses" table.
#
# Key design decision: items is a JSON column.
# Each expense stores a list of line items like:
# [{"subject": "Notebook", "amount": 50.0}, {"subject": "Pen", "amount": 10.0}]
#
# Why JSON and not a separate items table?
# → Items are always fetched with their parent expense.
#   A JSON column avoids a JOIN on every read.
#   Items have no independent lifecycle — they live and die with the expense.
#
# total is a computed column — recalculated in Python every time items change.
# Storing it avoids re-summing on every read/filter.

import uuid
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # user_id links every expense to its owner
    # ondelete="CASCADE" → DB-level cleanup if user row is deleted
    user_id = Column(
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,   # index makes filtering by user fast
    )

    category = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)

    # items = [{"subject": str, "amount": float}, ...]
    items = Column(JSON, nullable=False, default=list)

    # Pre-computed sum of all item amounts
    total = Column(Float, nullable=False, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="expenses")