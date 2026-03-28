# app/routes/auth_routes.py
# Route handlers for authentication.
# Routes are intentionally thin — all logic is in the controller.

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controller.auth_controller import google_signin
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schema.auth import GoogleTokenRequest, TokenResponse, UserResponse
from app.utils.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/google", response_model=TokenResponse)
async def google_auth(payload: GoogleTokenRequest, db: Session = Depends(get_db)):
    """
    Frontend sends Google's ID token.
    We verify it, upsert the user, and return our own JWT.
    """
    return google_signin(payload.token, db)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the logged-in user's profile.
    Useful for the frontend to refresh user info on page load.
    Protected — requires valid JWT in Authorization header.
    """
    return current_user