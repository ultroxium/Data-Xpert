from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.api.auth.response import UserInfo


class QuickNotes(BaseModel):
    id: int
    content: str
    updated_by: Optional[int]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    creator: Optional[UserInfo]

    class Config:
        from_attributes = True

class AddQuickNotes(BaseModel):
    content: str
    class Config:
        from_attributes = True