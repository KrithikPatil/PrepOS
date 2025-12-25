"""
PrepOS Backend Configuration
Settings loaded from environment variables
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # MongoDB
    mongodb_uri: str
    mongodb_db_name: str = "prepos"
    
    # Gemini API
    gemini_api_key: str
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days
    
    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:3001/api/auth/google/callback"
    
    # Frontend
    frontend_url: str = "http://localhost:3000"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 3001
    debug: bool = True
    
    # AI Models Configuration
    model_architect: str = "gemini-2.5-pro"      # Complex reasoning for questions
    model_detective: str = "gemini-2.5-flash"    # Fast pattern recognition
    model_tutor: str = "gemini-2.5-pro"          # Deep explanations
    model_strategist: str = "gemini-2.5-flash"   # Planning, cost-efficient
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()
