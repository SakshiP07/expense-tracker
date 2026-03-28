# app/controller/auth_controller.py
# Business logic for auth — keeps the route handler thin.
#
# google_signin() is the core flow:
# 1. Verify Google's token (raises 401 if fake/expired)
# 2. Extract user info from the verified token
# 3. Upsert: if user exists → update name/picture (they may change in Google)
#            if new user   → create their account automatically
# 4. Issue our JWT
# 5. Return token + profile

from sqlalchemy.orm import Session
from app.models.user import User
from app.middleware.auth import verify_google_token, create_access_token
from app.schema.auth import TokenResponse, UserResponse


def google_signin(token: str, db: Session) -> TokenResponse:
    # Step 1 & 2: verify with Google, extract info
    id_info = verify_google_token(token)
#     id_info = {
#     "sub": "test_user_001",
#     "email": "sakshi@example.com",
#     "name": "Sakshi",
#     "picture": ""
# }

    google_id = id_info["sub"]          # Google's unique user ID
    email     = id_info.get("email", "")
    name      = id_info.get("name", "")
    picture   = id_info.get("picture", "")

    # Step 3: upsert
    user = db.query(User).filter(User.id == google_id).first()

    if user:
        # Returning user — refresh their profile info
        user.name    = name
        user.picture = picture
    else:
        # First-ever login — create account automatically
        user = User(id=google_id, email=email, name=name, picture=picture)
        db.add(user)

    db.commit()
    db.refresh(user)

    # Step 4 & 5: issue JWT and return
    access_token = create_access_token(user_id=user.id)

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )