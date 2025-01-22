import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
    )
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
    )
    ALGORITHM: str = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 500)

    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL")
    PASSWORD_EMAIL: str = os.getenv("PASSWORD_EMAIL")
    GOOGLE_CLIENT_ID: str=os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str=os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str=os.getenv("GOOGLE_REDIRECT_URI")
    
    FRONTEND_URL: str=os.getenv("FRONTEND_URL")
    BUCKET_KEY_ID: str=os.getenv("BUCKET_KEY_ID")
    BUCKET_SECRET_KEY: str=os.getenv("BUCKET_SECRET_KEY")
    BUCKET_NAME: str =os.getenv("BUCKET_NAME")
    GENAI_API_KEY: str = os.getenv("GENAI_API_KEY")

    GITHUB_CLIENT_ID: str=os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: str=os.getenv("GITHUB_CLIENT_SECRET")
    GITHUB_REDIRECT_URI: str=os.getenv("GITHUB_REDIRECT_URI")

    class Config:
        env_file = ".env"


settings = Settings()
