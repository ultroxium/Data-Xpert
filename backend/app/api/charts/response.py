from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

from app.api.auth.response import UserInfo


class ChartCreate(BaseModel):
    key: str
    label: str
    description: Optional[str] = None
    option: Optional[str] = None
    column: Optional[str] = None
    dtype: Optional[str] = None
    xAxis: Optional[list] = None
    yAxis: Optional[list] = None


class ChartResponse(BaseModel):
    id: int
    key: str
    label: str
    description: Optional[str] = None
    option: Optional[str] = None
    column: Optional[str] = None
    dtype: Optional[str] = None
    workspace_id: int
    dataset_id: int
    created_by: int
    updated_by: Optional[int] = None
    updated_at: Optional[datetime] = None
    created_at: datetime
    creator: Optional[UserInfo] = None

    class Config:
        from_attributes = True


class ChartUpdate(BaseModel):
    key: Optional[str] = None
    label: Optional[str] = None
    description: Optional[str] = None
    option: Optional[str] = None
    column: Optional[str] = None
    dtype: Optional[str] = None
    xAxis: Optional[list] = None
    yAxis: Optional[list] = None
    layout: Optional[dict] = None
    color: Optional[str]= None

    class Config:
        from_attributes = True