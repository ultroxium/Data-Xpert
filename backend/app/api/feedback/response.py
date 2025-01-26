from pydantic import BaseModel, EmailStr


class FeedbackCreate(BaseModel):
    name: str
    email: EmailStr
    message: str
    