"""
Authentication Routes
Google OAuth 2.0 + JWT token management
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
from jose import jwt, JWTError
from authlib.integrations.starlette_client import OAuth
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

from config.settings import get_settings
from db.mongodb import get_users_collection

router = APIRouter()
settings = get_settings()

# OAuth setup
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str]
    subscription: str


def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def verify_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/google")
async def google_login(request: Request):
    """Initiate Google OAuth flow"""
    redirect_uri = settings.google_redirect_uri
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request):
    """Handle Google OAuth callback"""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        # Find or create user
        users = get_users_collection()
        existing_user = await users.find_one({"email": user_info["email"]})
        
        if existing_user:
            user_id = str(existing_user["_id"])
            # Update last login
            await users.update_one(
                {"_id": existing_user["_id"]},
                {"$set": {"updatedAt": datetime.utcnow()}}
            )
        else:
            # Create new user
            new_user = {
                "email": user_info["email"],
                "name": user_info.get("name", "CAT Aspirant"),
                "avatar": user_info.get("picture"),
                "provider": "google",
                "providerId": user_info["sub"],
                "subscription": "free",
                "performance": {
                    "sectionWise": {"VARC": 0, "DILR": 0, "QA": 0},
                    "topicWise": {},
                    "weakTopics": []
                },
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            result = await users.insert_one(new_user)
            user_id = str(result.inserted_id)
        
        # Create JWT token
        access_token = create_access_token({"sub": user_id, "email": user_info["email"]})
        
        # Redirect to frontend with token
        frontend_url = f"{settings.frontend_url}/auth/callback?token={access_token}"
        return RedirectResponse(url=frontend_url)
    
    except Exception as e:
        print(f"OAuth error: {e}")
        return RedirectResponse(url=f"{settings.frontend_url}/login?error=oauth_failed")


@router.get("/me", response_model=UserResponse)
async def get_current_user(request: Request):
    """Get current authenticated user"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    
    users = get_users_collection()
    user = await users.find_one({"_id": ObjectId(payload["sub"])})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        avatar=user.get("avatar"),
        subscription=user["subscription"]
    )


@router.post("/logout")
async def logout():
    """Logout - client should clear token"""
    return {"message": "Logged out successfully"}


# Dummy unlock for development
@router.post("/unlock/{plan}")
async def dummy_unlock(plan: str, request: Request):
    """Dummy unlock Pro/Premium for development"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    
    if plan not in ["pro", "premium", "free"]:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    users = get_users_collection()
    await users.update_one(
        {"_id": ObjectId(payload["sub"])},
        {"$set": {"subscription": plan, "updatedAt": datetime.utcnow()}}
    )
    
    return {"message": f"Unlocked {plan} plan", "subscription": plan}


class DevLoginRequest(BaseModel):
    email: str = "dev@prepos.io"
    name: str = "Dev User"


@router.post("/dev-login")
async def dev_login(data: DevLoginRequest):
    """
    DEVELOPMENT ONLY: Login without Google OAuth
    Creates or finds user and returns JWT token
    """
    if not settings.debug:
        raise HTTPException(status_code=403, detail="Dev login only available in debug mode")
    
    users = get_users_collection()
    
    # Find or create dev user
    existing_user = await users.find_one({"email": data.email})
    
    if existing_user:
        user_id = str(existing_user["_id"])
        await users.update_one(
            {"_id": existing_user["_id"]},
            {"$set": {"updatedAt": datetime.utcnow()}}
        )
        user_data = existing_user
    else:
        new_user = {
            "email": data.email,
            "name": data.name,
            "avatar": None,
            "provider": "development",
            "providerId": f"dev_{data.email}",
            "subscription": "pro",  # Dev users get pro for testing
            "performance": {
                "sectionWise": {"VARC": 65, "DILR": 58, "QA": 72},
                "topicWise": {"Reading Comprehension": 70, "Algebra": 65, "Geometry": 55},
                "weakTopics": ["Geometry", "Data Interpretation", "Para Jumbles"],
                "strongTopics": ["Arithmetic", "Reading Comprehension"]
            },
            "stats": {
                "testsCompleted": 5,
                "averageScore": 68,
                "studyHours": 42,
                "currentStreak": 3
            },
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        result = await users.insert_one(new_user)
        user_id = str(result.inserted_id)
        user_data = new_user
        user_data["_id"] = result.inserted_id
    
    # Create JWT token
    access_token = create_access_token({"sub": user_id, "email": data.email})
    
    return {
        "token": access_token,
        "user": {
            "id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "avatar": user_data.get("avatar"),
            "subscription": user_data["subscription"]
        }
    }

