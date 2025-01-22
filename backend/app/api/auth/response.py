
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserSignUp(BaseModel):
    name: str
    email: EmailStr


class OTPVerification(BaseModel):
    email: EmailStr
    otp: str


class SetPassword(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    message: str
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class User(BaseModel):
    name: str
    email: EmailStr
    is_verified: bool
    is_active: bool
    verified_at: str
    registered_at: str
    updated_at: str
    created_at: str

    class Config:
        from_attributes = True

class UserObj(BaseModel):
    id: int
    name: str
    email: EmailStr
    picture: Optional[str]
    
    class Config:
        from_attributes = True

class GetUser(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_verified: bool
    is_active: bool
    verified_at: Optional[datetime]
    registered_at: Optional[datetime]
    updated_at: Optional[datetime]
    created_at: Optional[datetime]
    picture: Optional[str]

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat(),
        }

class UserInfo(BaseModel):
    id: int
    name: str
    email: EmailStr
    picture: Optional[str]

    class Config:
        from_attributes = True