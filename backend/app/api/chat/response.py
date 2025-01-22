from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class GetChats(BaseModel):
    speaker: Optional[str] = None
    message: str
    created_at: datetime
    
    class Config:
        from_attributes = True