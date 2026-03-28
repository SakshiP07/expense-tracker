# app/middleware/auth.py
# Two jobs:
# 1. verify_google_token()  → send Google's ID token to Google's servers,
#                             confirm it was issued for OUR app, extract user info
# 2. get_current_user()     → FastAPI dependency used on every protected route.
#                             Decodes our JWT → loads user from DB → returns User object
#
# Security flow:
# Google Sign-In → Google ID token → verify_google_token() → our JWT
# Every protected request: our JWT → get_current_user() → User object

from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from sqlalchemy.orm import Session

from config import settings
from app.utils.database import get_db
from app.models.user import User

# HTTPBearer extracts "Bearer <token>" from the Authorization header
bearer_scheme = HTTPBearer()


def create_access_token(user_id: str) -> str:
    """
    Creates a signed HS256 JWT.
    Payload contains:
      sub → the user's ID (standard JWT claim for "subject")
      exp → expiry timestamp
      iat → issued-at timestamp
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),  # ensure it's a string for consistent JWT payloads
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_google_token(token: str) -> dict:
    """
    Calls Google's API to verify the ID token.
    Why we don't trust the token blindly:
    → Anyone could forge a JWT claiming to be a Google token.
      Only Google's servers can confirm it's real and was issued for our CLIENT_ID.

    Returns the decoded payload which contains:
      sub     → Google's unique user ID
      email   → user's email
      name    → user's display name
      picture → profile photo URL
    """
    try:
        id_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
        return id_info
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — add to any route to protect it.

    What it does:
    1. Extracts JWT from Authorization: Bearer <token> header
    2. Decodes and verifies the JWT signature
    3. Checks expiry
    4. Loads the user from DB using the ID in the token
    5. Returns the User object → available in the route as current_user

    Raises 401 if:
    - No token provided
    - Token signature is invalid (tampered)
    - Token is expired
    - User no longer exists in DB
    """
    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise auth_error
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
        )
    except jwt.PyJWTError:
        raise auth_error

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise auth_error

    return user