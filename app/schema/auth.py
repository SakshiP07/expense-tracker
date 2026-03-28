# app/schema/auth.py
# Pydantic models for authentication endpoints.
#
# GoogleTokenRequest → what the frontend POSTs to /auth/google
# UserResponse       → safe user profile (no internal IDs exposed beyond what's needed)
# TokenResponse      → what we return: our JWT + user profile

from pydantic import BaseModel, ConfigDict
from typing import Optional


class GoogleTokenRequest(BaseModel):
    token: str   # the raw Google ID token (a JWT from Google)


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse