from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class GetNotification(BaseModel):
    title: Optional[str] = None
    message: str
    tag: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True