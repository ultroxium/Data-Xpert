
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class GetModelLists(BaseModel):
    id: int
    name: str
    key: str
    description: Optional[str] = None
    category: Optional[str] = None
    isbasic: bool

    class config:
        from_attributes = True

class GetModel(BaseModel):
    id: Optional[int] = None
    processed_data_id: int
    name: Optional[str] = None
    model_id: Optional[int] = None
    target_column: Optional[str] = None
    target_encoder_path: Optional[str] = None
    version: Optional[int] = 1
    model_file_path: str
    model_metadata: Optional[dict] = None
    created_at: Optional[datetime] = None
    is_trained: Optional[bool] = False
    model: GetModelLists
    class config:
        from_attributes = True