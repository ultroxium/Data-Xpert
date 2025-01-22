from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.api.auth.response import UserObj
from app.api.roles_permissions.response import GetRole


class GetMember(BaseModel):
    id: int
    # team_id: int
    # user_id: int
    role_id: int
    email: Optional[str] = None
    # team: GetTeam
    # user: GetUser
    roles: Optional[GetRole]
    user_obj: Optional[UserObj]
    class config:
        from_attributes = True

class GetTeam(BaseModel):
    id: int
    name: str
    workspace_id: int
    # created_by: int
    # updated_by: Optional[int] = None
    # updated_at: Optional[datetime] = None
    # created_at: datetime
    members: Optional[List[GetMember]] = []
    
    class config:
        from_attributes = True

class CreateTeam(BaseModel):
    email: str
    team_id: int
    role_id: int
    workspace_id: int
    class Config:
        from_attributes = True
        
class GetTeamModel(BaseModel):
    id: int
    team_id: int
    user_id: Optional[int] = None
    role_id: int
    workspace_id: Optional[int] = None
    email: Optional[str] = None
    status: str
    class Config:
        from_attributes = True
        
        
class UpdateRole(BaseModel):
    role_id: int
    class Config:
        from_attributes = True