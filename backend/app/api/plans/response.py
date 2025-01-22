from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class GetPlan(BaseModel):
    id: int
    name: str
    price: Optional[float] = None
    max_workspaces: int
    max_datasets_per_workspace: int
    plan_id: int
    start_date: Optional[datetime] = None
    next_payment_date: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True