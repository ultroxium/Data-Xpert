from fastapi import APIRouter, status, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db

from app.api.auth.services import get_current_active_user
from app.api.charts.services import PublicServices, Services

from app.api.charts.response import ChartCreate, ChartResponse, ChartUpdate


router = APIRouter(
    prefix="/chart",
    tags=["Chart"],
    responses={404: {"description": "Not found"}},
)


def get_services(
    db: Session = Depends(get_db), current_user: dict = Depends(get_current_active_user)
) -> Services:
    return Services(db=db, current_user=current_user)

def get_public_services(db: Session = Depends(get_db)) -> PublicServices:
    return PublicServices(db=db)


@router.post("/", response_model=ChartResponse, status_code=status.HTTP_201_CREATED)
async def create_dataset(
    workspace_id:int,
    dataset_id: int,
    data: ChartCreate,
    services: Services = Depends(get_services),
):
    
    new_chart = await services.create_chart(workspace_id,dataset_id, data)
    return new_chart


@router.get("/public")
async def get_all_charts(workspace_id:int,dataset_id: int,LastOnly:bool=False,public_services: PublicServices = Depends(get_public_services)):
    return await public_services.get_charts(workspace_id,dataset_id,LastOnly)

@router.get("/")
def get_all_charts(workspace_id:int,dataset_id: int, services: Services = Depends(get_services)):
    charts = services.get_charts(workspace_id,dataset_id)
    return charts

@router.put("/{chart_id}")
def update_chart(
    workspace_id:int,
    chart_id: int,
    data: ChartUpdate,
    services: Services = Depends(get_services),
):
    updated_chart = services.update_chart(workspace_id, chart_id, data)
    return updated_chart

@router.delete("/{chart_id}")
def delete_chart(workspace_id:int, chart_id: int, services: Services = Depends(get_services)):
    services.delete_chart(workspace_id, chart_id)
    return {"message": "Chart deleted successfully"}

@router.post('/duplicate')
def duplicate_chart(
    workspace_id:int,
    chart_id: int,
    services: Services = Depends(get_services),
):
    new_chart = services.duplicate_chart(workspace_id,chart_id)
    return new_chart