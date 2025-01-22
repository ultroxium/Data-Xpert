import json
from typing import Dict, Optional
from fastapi import APIRouter, Body, File, Form, UploadFile, status, Depends,Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.api.datasets.response import (
    DatasetCreate,
    GetDataset,
    GetAllDatasets,
    HeadersModel,
    UpdateDataset,
)
from app.api.auth.services import get_current_active_user
from app.api.datasets.services import Services
from app.Helper.check_permissions import PermissionCheck



router = APIRouter(
    prefix="/dataset",
    tags=["Dataset"],
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


@router.post("/", response_model=GetAllDatasets, status_code=status.HTTP_201_CREATED)
def create_dataset(
    workspace_id: int,
    name: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_edit_access(workspace_id)
    new_dataset = services.create_dataset(workspace_id, name, description, file)
    return new_dataset


#upload from url
@router.post("/upload-from-url", response_model=GetAllDatasets, status_code=status.HTTP_201_CREATED)
def create_dataset_from_url(
    workspace_id: int,
    name: str = Form(...),
    description: str = Form(None),
    url: str = Form(...),
    headers: str = Form(None),
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_edit_access(workspace_id)
    headers_dict = json.loads(headers) if headers else None
    new_dataset = services.create_dataset_from_url(workspace_id, name, description, url, headers_dict)
    return new_dataset


#refresh api data
@router.put("/refresh-api-data", status_code=status.HTTP_201_CREATED)
def refresh_api_data(
    workspace_id: int,
    dataset_id: int,
    refresh_period: Optional[int] = None,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_edit_access(workspace_id)
    new_dataset = services.refresh_api_data(workspace_id, dataset_id, refresh_period)
    return new_dataset


@router.put("/move", response_model=GetAllDatasets, status_code=status.HTTP_201_CREATED)
def move_dataset(
    current_workspace_id:int,
    workspace_id: int,
    dataset_id: int,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_edit_access(current_workspace_id)
    permission.check_edit_access(workspace_id)
    dataset = services.move_dataset(current_workspace_id,workspace_id, dataset_id)
    return dataset


@router.put("/handle-missing-value")
def handle_missing_value(
    workspace_id: int,
    dataset_id: int,
    handleType: str,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_edit_access(workspace_id)
    return services.handle_missing_value(workspace_id,dataset_id, handleType)


@router.put("/{dataset_id}", response_model=GetAllDatasets)
def update_dataset(
    dataset_id: int,
    workspace_id: int,
    data: UpdateDataset,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_edit_access(workspace_id)
    dataset = services.update_dataset(workspace_id, dataset_id,data)
    return dataset


@router.delete("/{dataset_id}")
def delete_dataset(
    workspace_id: int,
    dataset_id: int,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_edit_access(workspace_id)
    return services.delete_dataset(workspace_id,dataset_id)


@router.get("/data")
def get_datasets_data(
    workspace_id: int,
    dataset_id: int,
    query: str = Query(None, description="Search value in any field"),
    limit: int = Query(10, description="Limit number of rows to fetch"),
    offset: int = Query(0, description="Offset for pagination"),
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_view_access(workspace_id)
    data = services.get_dataset_data(workspace_id,dataset_id,limit,offset,query)
    return data

@router.get("/data-insights")
def get_datasets_data_insights(
    workspace_id: int,
    dataset_id: int,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_view_access(workspace_id)
    data = services.get_dataset_data_insights(workspace_id,dataset_id)
    return data

@router.get("/correlation-matrix")
def get_correlation_matrix(
    workspace_id: int,
    dataset_id: int,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_view_access(workspace_id)
    data = services.get_correlation_matrix(workspace_id,dataset_id)
    return data


@router.get("/column-info")
def get_column_info(
    workspace_id: int,
    dataset_id: int,
    isProcessed: bool= False,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_view_access(workspace_id)
    data = services.get_dataset_column_info(workspace_id,dataset_id,isProcessed)
    return data


@router.get("/default", response_model=list[GetAllDatasets])
def get_default_datasets(
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    datasets = services.get_all_default_datasets()
    return datasets


@router.get("/{dataset_id}", response_model=GetDataset)
def get_dataset(
    workspace_id: int,
    dataset_id: int,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_view_access(workspace_id)
    dataset = services.get_dataset(workspace_id,dataset_id)
    return dataset


@router.post(
    "/duplicate", response_model=GetAllDatasets, status_code=status.HTTP_201_CREATED
)
def duplicate_dataset(
    workspace_id: int,
    dataset_id: int,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_edit_access(workspace_id)
    dataset = services.duplicate_dataset(workspace_id,dataset_id)
    return dataset


@router.get("/", response_model=list[GetAllDatasets])
def get_datasets(
    workspace_id: int,
    services: Services = Depends(get_services),
    permission: PermissionCheck = Depends(get_permission_check)
):
    permission.check_view_access(workspace_id)
    datasets = services.get_all_datasets(workspace_id)
    return datasets
