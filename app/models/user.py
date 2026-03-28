# app/models/user.py
# The "users" table.
#
# Why Google ID as primary key?
# → Google guarantees it's globally unique per account.
#   No need for a separate UUID — it IS the user's identity.
#
# We store only what Google gives us after OAuth:
# id, email, name, picture (profile photo URL).
# No passwords. Ever.

from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)   # Google's "sub" field
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    picture = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship: one user → many expenses
    # cascade="all, delete-orphan" → deleting a user deletes their expenses too
    expenses = relationship(
        "Expense", back_populates="owner", cascade="all, delete-orphan"
    )