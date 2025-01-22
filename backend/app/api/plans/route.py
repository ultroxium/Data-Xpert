


from fastapi import APIRouter, Depends,status
from sqlalchemy.orm import Session
from app.api.auth.services import get_current_active_user
from app.database.database import get_db
from app.api.plans.services import Services
from app.Helper.check_permissions import PermissionCheck


router = APIRouter(
    prefix="/plan",
    tags=["Plan"],
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


@router.get("/", response_model=[], status_code=status.HTTP_201_CREATED)
def get_plan(
    services: Services = Depends(get_services),
):
    plan = services.get_plan()
    return plan
