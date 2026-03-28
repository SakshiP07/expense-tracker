# app/schema/auth.py
from pydantic import BaseModel, ConfigDict
from typing import Optional


class GoogleTokenRequest(BaseModel):
    token: str  # the Google ID token sent from the frontend


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