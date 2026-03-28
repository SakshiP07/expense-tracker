# app/utils/database.py
# SQLAlchemy engine + session factory + Base class.
#
# engine       → the actual PostgreSQL connection pool
# SessionLocal → factory that creates one DB session per request
# Base         → all ORM models inherit from this
# get_db()     → FastAPI dependency injected into every route
#                automatically closes the session after each request

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # test connection before use → prevents stale conn errors
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Yields a DB session for the duration of one HTTP request.
    'finally' guarantees the session closes even if an exception occurs.

    Usage in any route:
        async def my_route(db: Session = Depends(get_db)):
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Called on app startup.
    Creates all tables that don't exist yet.
    Models must be imported before this runs so Base knows about them.
    """
    from app.models import user, expense  # noqa — registers models with Base
    Base.metadata.create_all(bind=engine)