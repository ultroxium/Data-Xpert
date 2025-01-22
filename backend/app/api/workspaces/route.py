from fastapi import APIRouter, status, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.api.workspaces.response import WorkspaceCreate, GetWorkspace
from app.api.auth.services import get_current_active_user
from app.api.workspaces.services import Services

router = APIRouter(
    prefix="/workspace",
    tags=["Workspace"],
    responses={404: {"description": "Not found"}},
)


def get_services(
    db: Session = Depends(get_db), current_user: dict = Depends(get_current_active_user)
) -> Services:
    return Services(db=db, current_user=current_user)


@router.post("/", response_model=WorkspaceCreate, status_code=status.HTTP_201_CREATED)
def create_workspace(
    data: WorkspaceCreate,
    services: Services = Depends(get_services),
):
    new_workspace = services.create_workspace(data)
    return new_workspace


@router.put("/{workspace_id}", response_model=WorkspaceCreate)
def update_workspace(
    workspace_id: int,
    data: WorkspaceCreate,
    services: Services = Depends(get_services),
):
    workspace = services.update_workspace(data, workspace_id)
    return workspace


@router.delete("/{workspace_id}")
def delete_workspace(
    workspace_id: int,
    services: Services = Depends(get_services),
):
    return services.delete_workspace(workspace_id)


@router.get("/{workspace_id}", response_model=GetWorkspace)
def get_workspace(
    workspace_id: int,
    services: Services = Depends(get_services),
):
    workspace = services.get_workspace(workspace_id)
    return workspace


@router.get("/", response_model=list[GetWorkspace])
def get_workspaces(
    services: Services = Depends(get_services),
):
    workspaces = services.get_all_workspaces()
    return workspaces
