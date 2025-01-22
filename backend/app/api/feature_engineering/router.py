from sqlalchemy.orm import Session
from fastapi import Depends, Query,APIRouter
from app.api.auth.services import get_current_active_user
from app.api.feature_engineering.services import Services
from app.database.database import get_db


router = APIRouter(
    prefix="/processing",
    tags=["Feature Engineering"],
    responses={404: {"description": "Not found"}},
)

def get_services(
    db: Session = Depends(get_db), current_user: dict = Depends(get_current_active_user)
) -> Services:
    return Services(db=db, current_user=current_user)


@router.get('/')
def get_processed_data(workspace_id: int,dataset_id:int,query: str = Query(None, description="Search value in any field"),
    limit: int = Query(10, description="Limit number of rows to fetch"),
    offset: int = Query(0, description="Offset for pagination"),services: Services = Depends(get_services)):
    return services.get_data(workspace_id,dataset_id,limit,offset,query)

@router.post('/clean')
def clean_data(workspace_id: int,dataset_id:int,config: dict,services: Services = Depends(get_services)):
    #remove_columns, fill_missing, drop_missing, remove_duplicates, convert_dtypes, clean_strings
    #exammple config
    # {
    #     "remove_columns": ["column1","column2"],
    #     "fill_missing": {
    #         "strategy": "mean",
    #         "columns": ["column1","column2"],
    #         "fill_value": None
    #     },
    #     "drop_missing": {
    #         "axis": 0,
    #         "threshold": None
    #     },
    #     "remove_duplicates": {
    #         "subset": None
    #     },
        # "convert_dtypes": {
        #     "conversions": {
        #         "column1": "int",
        #         "column2": "float"
        #     }
        # },
    #     "clean_strings": {}
    # }
    return services.clean_data(workspace_id,dataset_id,config)

@router.post('/encode')
def encode_data(workspace_id: int,dataset_id:int,config: dict,services: Services = Depends(get_services)):
    #exammple config
    # {
    #     "encode_columns": ["column1","column2"],
    #     "type": "label"
    # }
    return services.encode_data(workspace_id,dataset_id,config)


@router.post('/outlier-handler')
def handle_outliers(workspace_id: int,dataset_id:int,config: dict,services: Services = Depends(get_services)):
    #exammple config
    # {
    #     "columns": ["column1","column2"],
    #     "method": "zscore",
    #     "threshold": 3
    # }
    return services.handle_outliers(workspace_id,dataset_id,config)

@router.post('/normalize')
def normalize_data(workspace_id: int,dataset_id:int,config: dict,services: Services = Depends(get_services)):
    #exammple config
    # {
    #     "normalize_columns": ["column1","column2"],
    #     "type": "minmax"
    # }
    return services.normalize_data(workspace_id,dataset_id,config)


@router.post('/auto-process')
def auto_process(workspace_id: int,dataset_id:int,services: Services = Depends(get_services)):
    return services.auto_process(workspace_id,dataset_id)


@router.get('/back-to-original')
def get_old_file_version(workspace_id: int,dataset_id:int,services: Services = Depends(get_services)):
    return services.get_old_file_version(workspace_id,dataset_id)

@router.get('/suggestions')
def get_suggestions(workspace_id: int,dataset_id:int,problem:str,services: Services = Depends(get_services)):
    return services.get_suggestions(workspace_id,dataset_id,problem)

@router.get('/distributions')
def get_distributions(workspace_id: int,dataset_id:int,services: Services = Depends(get_services)):
    return services.get_distributions(workspace_id,dataset_id)

@router.get('/correlation')
def get_correlation(workspace_id: int,dataset_id:int,services: Services = Depends(get_services)):
    return services.get_correlation_matrix(workspace_id,dataset_id)