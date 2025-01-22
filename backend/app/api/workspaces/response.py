from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

from app.api.auth.response import UserInfo
from app.api.workspaces.teams.response import GetTeam


class WorkspaceCreate(BaseModel):
    name: str


class GetWorkspace(BaseModel):
    id: int
    name: str
    created_by: int
    team_id: Optional[int] = None
    updated_by: Optional[int] = None
    updated_at: Optional[datetime] = None
    created_at: datetime
    teams: List[GetTeam]
    creator: Optional[UserInfo] = None
    
    class config:
        from_attributes = True
