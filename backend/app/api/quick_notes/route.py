from typing import List, Optional
from fastapi import APIRouter, Depends,status
from sqlalchemy.orm import Session
from app.api.auth.services import get_current_active_user
from app.api.quick_notes.response import AddQuickNotes, QuickNotes
from app.database.database import get_db
from app.Helper.check_permissions import PermissionCheck
from app.api.quick_notes.services import Services


router = APIRouter(
    prefix="/quick-notes",
    tags=["Quick Notes"],
    responses={404: {"description": "Not found"}},
)


def get_services(
    db: Session = Depends(get_db), current_user: dict = Depends(get_current_active_user)
) -> Services:
    return Services(db=db, current_user=current_user)

def get_permission_check(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    return PermissionCheck(db=db, current_user=current_user)

@router.get("/", response_model=List[QuickNotes])
def get_quick_notes(
    workspace_id: int,
    dataset_id: int,
    services: Services = Depends(get_services),
    permission_check: PermissionCheck = Depends(get_permission_check)
):
    permission_check.check_view_access(workspace_id=workspace_id)
    return services.get_quick_notes(workspace_id=workspace_id, dataset_id=dataset_id)

@router.post("/",)
def create_quick_notes(
    workspace_id: int,
    dataset_id: int,
    notes: AddQuickNotes,
    services: Services = Depends(get_services),
    permission_check: PermissionCheck = Depends(get_permission_check)
):
    permission_check.check_edit_access(workspace_id=workspace_id)
    return services.create_quick_notes(workspace_id=workspace_id, dataset_id=dataset_id, notes=notes)

@router.put('/{note_id}', response_model=QuickNotes)
def update_quick_notes(
    workspace_id: int,
    dataset_id: int,
    note_id: int,
    notes: AddQuickNotes,
    services: Services = Depends(get_services),
    permission_check: PermissionCheck = Depends(get_permission_check)
):
    permission_check.check_edit_access(workspace_id=workspace_id)
    return services.update_quick_notes(workspace_id=workspace_id, dataset_id=dataset_id,note_id=note_id, notes=notes)


@router.delete('/{note_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_quick_notes(
    workspace_id: int,
    dataset_id: int,
    note_id: int,
    services: Services = Depends(get_services),
    permission_check: PermissionCheck = Depends(get_permission_check)
):
    permission_check.check_edit_access(workspace_id=workspace_id)
    return services.delete_quick_notes(workspace_id=workspace_id, dataset_id=dataset_id, note_id=note_id)
