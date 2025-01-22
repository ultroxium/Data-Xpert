from datetime import datetime
from fastapi import APIRouter, status, Depends
import json
import re
from typing import List
from app.api.dashboard.response import  GetWorkspaceInfoResponse
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.api.auth.services import get_current_active_user
from app.api.dashboard.services import Services





router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    responses={404: {"description": "Not found"}},
)

def get_services(db: Session = Depends(get_db), current_user: dict = Depends(get_current_active_user)) -> Services:
    return Services(db=db, current_user=current_user)

@router.get("/", response_model=GetWorkspaceInfoResponse)
def get_all_workspace_insights(services: Services = Depends(get_services)):
    return services.workspace_insights()
