from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class GetRole(BaseModel):
    id: int
    name: str
    # description: Optional[str] = None
    
    class config:
        from_attributes = True