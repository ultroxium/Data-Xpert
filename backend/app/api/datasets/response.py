from datetime import datetime
from typing import Dict, List, Optional
from fastapi import File, Form, UploadFile
from pydantic import BaseModel, EmailStr

from app.api.auth.response import UserObj


class DatasetCreate:
    name: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),


class UpdateDataset(BaseModel):
    name: str
    description: Optional[str] = None

class HeadersModel(BaseModel):
    headers: Dict[str, str]


class GetDataset(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    data: list
    workspace_id: int
    created_by: int
    updated_by: Optional[int] = None
    updated_at: Optional[datetime] = None
    created_at: datetime


class GetAllDatasets(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    workspace_id: int
    created_by: int
    is_api_data: Optional[bool] = False
    refresh_period: Optional[int] = None
    updated_by: Optional[int] = None
    updated_at: Optional[datetime] = None
    created_at: datetime
    created_by: UserObj
    
    class config:
        from_attributes = True