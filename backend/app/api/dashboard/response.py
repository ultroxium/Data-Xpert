from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class GetDatasetsInfo(BaseModel):
    # id: int
    workspace: str
    files: int
    class Config:
        from_attributes = True

class GetChartsInfo(BaseModel):
    # id: int
    workspace: str
    charts: int
    class Config:
        from_attributes = True


class GetWorkspaceInfoResponse(BaseModel):
    dataset_info: List[GetDatasetsInfo]
    chart_info: List[GetChartsInfo]
    total_workspaces: int
    total_charts: int
    total_datasets: int
    recent_uploades: List[dict]
    class Config:
        from_attributes = True