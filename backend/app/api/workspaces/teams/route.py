from typing import List
from fastapi import APIRouter,Depends,status
from sqlalchemy.orm import Session
from app.api.workspaces.teams.response import CreateTeam, GetTeamModel, UpdateRole
from app.database.database import get_db
from app.api.auth.services import get_current_active_user

from app.api.workspaces.teams.services import Services



router = APIRouter(
    prefix="/team-member",
    tags=["Teams"],
    responses={404: {"description": "Not found"}},
)


def get_services(
    db: Session = Depends(get_db), current_user: dict = Depends(get_current_active_user)
) -> Services:
    return Services(db=db, current_user=current_user)

@router.post("/", response_model=GetTeamModel, status_code=status.HTTP_201_CREATED)
async def create(
    data: CreateTeam,
    services: Services = Depends(get_services),
):
    new_team = await services.create_team_member(data)
    return new_team

@router.put("/{member_id}", response_model=GetTeamModel)
def update(
    member_id: int,
    data: UpdateRole,
    services: Services = Depends(get_services),
):
    team = services.update_team_member(data, member_id)
    return team

@router.delete("/{member_id}", response_model=GetTeamModel)
async def delete(
    member_id: int,
    services: Services = Depends(get_services),
):
    team = await services.delete_team_member(member_id)
    return team

@router.get("/{team_id}", response_model=List[GetTeamModel])
def get(
    team_id: int,
    services: Services = Depends(get_services),
):
    team = services.get_team_member(team_id)
    return team