from sqlalchemy.orm import Session
from app.api.models.response import GetModel, GetModelLists
from app.database.database import get_db
from app.api.auth.services import get_current_active_user
from app.api.models.services import PublicServices, Services
from fastapi import APIRouter, Depends

router = APIRouter(
    prefix="/model",
    tags=["AI Models"],
    responses={404: {"description": "Not found"}},
)

def get_services(
    db: Session = Depends(get_db), current_user: dict = Depends(get_current_active_user)
) -> Services:
    return Services(db=db, current_user=current_user)

def get_public_services(db: Session = Depends(get_db)) -> PublicServices:
    return PublicServices(db=db)


@router.get('/',response_model=GetModel)
def get_model(workspace_id: int,dataset_id:int, services: Services = Depends(get_services)):
    return services.get_model(workspace_id,dataset_id)

@router.delete('/')
def delete_model(workspace_id: int,dataset_id:int,id:int, services: Services = Depends(get_services)):
    return services.delete_model(workspace_id,dataset_id,id)

@router.get('/list',response_model=list[GetModelLists])
def get_model_lists(workspace_id: int,dataset_id:int,isbasic:bool=True, services: Services = Depends(get_services)):
    return services.get_model_lists(workspace_id,dataset_id,isbasic)

@router.post('/')
def create_model(workspace_id: int,dataset_id:int,type:str,config:dict, services: Services = Depends(get_services)):
    return services.create_model(workspace_id,dataset_id,type,config)

@router.post('/predict')
def predict(workspace_id: int,dataset_id:int,config:dict, services: Services = Depends(get_services)):
    return services.predict(workspace_id,dataset_id,config)

@router.post('/predictify')
def predictify(workspace_id: int,dataset_id:int,config:dict, public_services: PublicServices = Depends(get_public_services)):
    return public_services.predict(workspace_id,dataset_id,config)

@router.get('/input-columns')
async def get_input_columns(workspace_id: int,dataset_id:int, services: Services = Depends(get_services)):
    return services.get_input_columns(workspace_id,dataset_id)

@router.post('/auto-ml')
def run_auto_ml(workspace_id: int,dataset_id:int,problem_type: str,config:dict, services: Services = Depends(get_services)):
    return services.run_auto_ml(workspace_id,dataset_id,problem_type,config)