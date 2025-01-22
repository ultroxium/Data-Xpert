from datetime import datetime
from io import BytesIO
from fastapi import Body, UploadFile, status, HTTPException
import numpy as np
from app.Helper.dataset_explore import DataExplorer
from app.api.datasets.utils.fetchApiData import URLToDataFrame
from app.api.feature_engineering.model import ProcessedDataModel
from app.api.workspaces.teams.members_model import TeamMemberModel
from app.api.workspaces.teams.model import TeamModel
from app.database.database import get_db
from app.api.auth.services import get_current_active_user
from app.api.datasets.model import DatasetModel
from app.api.datasets.response import DatasetCreate, UpdateDataset
from sqlalchemy.orm import Session
from app.api.workspaces.model import WorkspaceModel
import math
from sqlalchemy.orm import aliased,joinedload
from app.Helper.B2fileManager import B2FileManager

import random
import string

import pandas as pd
import sys
import json

from typing import Any, Dict, Optional

class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user
        self.b2_filemanager = B2FileManager()
        
    def generate_random_suffix(length=5):
        return "".join(
            random.choices(
                string.ascii_lowercase + string.ascii_uppercase + string.digits,
                k=length,
            )
        )
        
    def _query_non_deleted_dataset(self, **filters):
        return (
            self.db.query(DatasetModel)
            .filter_by(**filters, is_deleted=False)
            .first()
        )

    def create_dataset(self,workspace_id, name: str, description: str, file: UploadFile):
        if workspace_id ==0 or not workspace_id:
            workspace = (
                self.db.query(WorkspaceModel)
                .filter(
                    WorkspaceModel.created_by == self.current_user.id,
                    WorkspaceModel.name == "Default Workspace",
                    WorkspaceModel.is_deleted == False
                )
                .first()
            )

            if not workspace:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Default workspace not found",
                )

            wid = workspace.id
            wname = workspace.name
        else:
            workspace = (
                self.db.query(WorkspaceModel)
                .filter(
                    WorkspaceModel.id == workspace_id,
                    WorkspaceModel.is_deleted == False
                )
                .first()
            )
            wid = workspace_id
            wname = workspace.name

        #check total num of dataset in workspace    
        dataset_count = (
            self.db.query(DatasetModel)
            .filter(DatasetModel.workspace_id == wid, DatasetModel.is_deleted == False)
            .count()
        )

        if dataset_count >= 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have exceeded the maximum limit of datasets. If you need more, please contact support.",
            )

        existing_dataset = self._query_non_deleted_dataset(name=name, workspace_id=wid)
        if existing_dataset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dataset with this name already exists",
            )
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension != "csv":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files are allowed",
            )
        data_path = f"{self.current_user.id}/{wname}/datasets/{name}"
        uploaded_dataset = pd.read_csv(BytesIO(file.file.read()))
        self.b2_filemanager.write_file(uploaded_dataset, data_path, 'csv')


        
        # Create new dataset
        new_dataset = DatasetModel(
            name=name,
            description=description,
            data=data_path,
            workspace_id=wid,
            created_by=self.current_user.id,
        )

        self.db.add(new_dataset)

        self.db.commit()
        self.db.refresh(new_dataset)
        
        created_dataset = self.db.query(DatasetModel).options(joinedload(DatasetModel.creator)).filter(DatasetModel.id == new_dataset.id).one_or_none()
        df= self.b2_filemanager.read_file(created_dataset.data, 'csv')

        processed_data_path = f"{self.current_user.id}/{wname}/datasets/{created_dataset.id}/{name}"
        self.b2_filemanager.write_file(uploaded_dataset, processed_data_path, 'csv')

        cleaned_data = ProcessedDataModel(
            dataset_id=created_dataset.id,
            data=processed_data_path,
            version=1
        )
        self.db.add(cleaned_data)
        self.db.commit()

        # Format the response
        response = {
            "id": created_dataset.id,
            "name": created_dataset.name,
            "description": created_dataset.description,
            "workspace_id": created_dataset.workspace_id,
            "updated_by": created_dataset.updated_by,
            "updated_at": created_dataset.updated_at,
            "created_at": created_dataset.created_at,
            "created_by": {
                "id": created_dataset.creator.id,
                "name": created_dataset.creator.name,
                "email": created_dataset.creator.email,
                "picture": created_dataset.creator.picture,
            } if created_dataset.creator else None
        }

        return response


    def update_dataset(self, workspace_id, dataset_id,data):
        dataset = (
            self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
        )
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="dataset not found",
            )
        dataset.name = data.name
        dataset.description = data.description
        dataset.data = data.data
        dataset.updated_by = self.current_user.id
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def delete_dataset(self,workspace_id, dataset_id):
        
        dataset = (
            self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
        )
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="dataset not found",
            )
        self.db.delete(dataset)
        self.db.commit()
        return {"message": "dataset deleted successfully"}

    def get_dataset(self,workspace_id, dataset_id):
        dataset = (
            self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
        )
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="dataset not found",
            )
        return dataset

    def duplicate_dataset(self,workspace_id, dataset_id):
                
        dataset = (
            self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
        )
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found",
            )
        
        dataset_count = (
            self.db.query(DatasetModel)
            .filter(DatasetModel.workspace_id == dataset.workspace_id, DatasetModel.is_deleted == False)
            .count()
        )

        if dataset_count >= 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have exceeded the maximum limit of datasets. If you need more, please contact support.",
            )

        # Split the name and extension
        name_parts = dataset.name.rsplit(".", 1)
        if len(name_parts) == 2:
            base_name, extension = name_parts
        else:
            base_name = dataset.name
            extension = ""

        # Generate the new name with incremental copy number
        index = 1
        if extension:
            new_name = f"{base_name}_copy({index}).{extension}"
        else:
            new_name = f"{base_name}_copy({index})"

        # Check for existing names and increment the index
        while self.db.query(DatasetModel).filter(DatasetModel.name == new_name).first():
            index += 1
            if extension:
                new_name = f"{base_name}_copy({index}).{extension}"
            else:
                new_name = f"{base_name}_copy({index})"

        # Create the new dataset
        new_dataset = DatasetModel(
            name=new_name,
            description=dataset.description,
            data=dataset.data,
            data_metadata=dataset.data_metadata,
            workspace_id=dataset.workspace_id,
            created_by=self.current_user.id,
        )

        self.db.add(new_dataset)
        self.db.commit()
        self.db.refresh(new_dataset)
        duplicated_dataset = self.db.query(DatasetModel).options(joinedload(DatasetModel.creator)).filter(DatasetModel.id == new_dataset.id).one_or_none()
        
        response = {
            "id": duplicated_dataset.id,
            "name": duplicated_dataset.name,
            "description": duplicated_dataset.description,
            "workspace_id": duplicated_dataset.workspace_id,
            "updated_by": duplicated_dataset.updated_by,
            "updated_at": duplicated_dataset.updated_at,
            "created_at": duplicated_dataset.created_at,
            "created_by": {
                "id": duplicated_dataset.creator.id,
                "name": duplicated_dataset.creator.name,
                "email": duplicated_dataset.creator.email,
                "picture": duplicated_dataset.creator.picture,
            } if duplicated_dataset.creator else None
        }
        
        return response


    def move_dataset(self,current_workspace_id, workspace_id: int, dataset_id: int):
        
        dataset = (
        self.db.query(DatasetModel)
        .options(joinedload(DatasetModel.creator))
        .filter(DatasetModel.id == dataset_id)
        .first()
        )
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="dataset not found",
            )
        dataset.workspace_id = workspace_id
        dataset.updated_at = datetime.now()

        # Assuming you have related models defined with relationships
        # related_tables = [ChartModel,DatasetModel]  # Add your related models here

        # # Perform bulk update for all related models
        # for related_model in related_tables:
        #     self.db.query(related_model).filter(related_model.dataset_id == dataset_id).update(
        #         {related_model.workspace_id: workspace_id}, synchronize_session=False
        #     )

        self.db.commit()
        self.db.refresh(dataset)
        
        dataset_response = {
            "id": dataset.id,
            "name": dataset.name,
            "description": dataset.description,
            "workspace_id": dataset.workspace_id,
            "created_by": {
                "id": dataset.creator.id,
                "name": dataset.creator.name,
                "email": dataset.creator.email,
                "picture": dataset.creator.picture,
            } if dataset.creator else None,
            "updated_by": dataset.updated_by,
            "updated_at": dataset.updated_at,
            "created_at": dataset.created_at,
            }
        
    
        return dataset_response

    def get_all_datasets(self, workspace_id: int = None):
    # Alias for team members
        team_member_alias = aliased(TeamMemberModel)

        # Query to fetch workspaces accessible to the current user
        accessible_workspaces_query = (
            self.db.query(WorkspaceModel)
            .outerjoin(TeamModel, TeamModel.workspace_id == WorkspaceModel.id)
            .outerjoin(team_member_alias, team_member_alias.team_id == TeamModel.id)
            .filter(
                (WorkspaceModel.created_by == self.current_user.id) |  # Created by the current user
                (team_member_alias.user_id == self.current_user.id)    # Associated with user's teams
            )
            .filter(WorkspaceModel.is_deleted == False)  # Filter out deleted workspaces
            .distinct()  # Ensure no duplicates
        )

        # If a workspace_id is provided, filter by that specific workspace
        if workspace_id is not None:
            accessible_workspaces_query = accessible_workspaces_query.filter(
                WorkspaceModel.id == workspace_id
            )
            
        # Execute query to get accessible workspace IDs
        accessible_workspace_ids = {workspace.id for workspace in accessible_workspaces_query.all()}

        # Query to fetch datasets from accessible workspaces
        datasets_query = (
            self.db.query(DatasetModel)
            .options(joinedload(DatasetModel.creator))
            .filter(DatasetModel.workspace_id.in_(accessible_workspace_ids))
            .all()
        )

        datasets = [
            {
                "id": dataset.id,
                "name": dataset.name,
                "description": dataset.description,
                "workspace_id": dataset.workspace_id,
                "created_by": {
                "id": dataset.creator.id,
                "name": dataset.creator.name,
                "email": dataset.creator.email,
                "picture": dataset.creator.picture,
            } if dataset.creator else None,
                "is_api_data": dataset.is_api_data,
                "refresh_period": dataset.refresh_period,
                "updated_by": dataset.updated_by,
                "updated_at": dataset.updated_at,
                "created_at": dataset.created_at,
            }
            for dataset in datasets_query
        ]

        return datasets

    def get_all_default_datasets(self):
        workspace = (
            self.db.query(WorkspaceModel)
            .filter(
                WorkspaceModel.created_by == self.current_user.id,
                WorkspaceModel.name == "Default Workspace",
            )
            .first()
        )

        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Default workspace not found",
            )

        datasets_query = (
            self.db.query(DatasetModel)
            .options(joinedload(DatasetModel.creator))
            .filter(
                DatasetModel.created_by == self.current_user.id,
                DatasetModel.workspace_id == workspace.id,
            )
            .all()
        )

        datasets = [
            {
                "id": dataset.id,
                "name": dataset.name,
                "description": dataset.description,
                "workspace_id": dataset.workspace_id,
                "created_by": {
                "id": dataset.creator.id,
                "name": dataset.creator.name,
                "email": dataset.creator.email,
                "picture": dataset.creator.picture,
            } if dataset.creator else None,
                "is_api_data": dataset.is_api_data,
                "refresh_period": dataset.refresh_period,
                "updated_by": dataset.updated_by,
                "updated_at": dataset.updated_at,
                "created_at": dataset.created_at,
            }
            for dataset in datasets_query
        ]

        return datasets

    def get_dataset_data(self,workspace_id, dataset_id: int, limit:int, offset:int,query: str = None) -> Dict:
        dataset = (
            self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
        )
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found",
            )

        uploaded_csv_data = self.b2_filemanager.read_file(dataset.data, 'csv')
        unformatted_raw_data= uploaded_csv_data.to_json(orient='records')
        raw_data = json.loads(unformatted_raw_data)

        filtered_data = []
        if query:
            filtered_data = [
                item for item in raw_data if any(query.lower() in str(value).lower() for value in item.values())
            ]
        else:
            filtered_data = raw_data
        paginated_data = filtered_data[offset:offset+limit]

        isNull = uploaded_csv_data.isnull().any().any()
        total_null = uploaded_csv_data.isnull().sum().sum()
        if isNull:
            null_presence = "Yes"
        else:
            null_presence = "No"

        # Extract dataset name
        dataset_name = dataset.name
        # Extract description of data
        data_description = dataset.description

        return {
            "data": paginated_data,
            "dataset_name": dataset_name,
            "description": data_description,
            "isNull": null_presence,
            "total_null": total_null.__str__(),
            "total": len(filtered_data),
            "limit": limit,
            "offset": offset,
        }
    
    def get_dataset_data_insights(self,workspace_id, dataset_id: int):
        dataset = (
            self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
        )
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found",
            )

        data_explore = DataExplorer(dataset.data)
        df = data_explore.get_df()
        metadata = data_explore.find_data_types()
        paginate_df = df.head(10)
        file_size = data_explore.get_file_size()

        # Generate column insights
        column_insights = {}
        for column in metadata:
            if column["type"] in ["number", "float"]:
                column_insights[column["name"]] = {
                    "count": df[column["name"]].count() - df[column["name"]].isnull().sum(),
                    "mean": df[column["name"]].mean(),
                    "median": df[column["name"]].median(),
                    "std_dev": df[column["name"]].std(),
                    "min": df[column["name"]].min(),
                    "max": df[column["name"]].max(),
                    "null_value": df[column["name"]].isnull().sum(),
                }
            else:
                column_insights[column["name"]] = {
                    "count": df[column["name"]].count() - (df[column["name"]] == "").sum(),
                    "unique_values": df[column["name"]].nunique(),
                    "most_frequent": (
                        df[column["name"]].mode()[0] if not df[column["name"]].mode().empty else None
                    ),
                    "null_value": (df[column["name"]] == "").sum(),
                }

        # Extract dataset name
        dataset_name = dataset.name
        # Extract description of data
        data_description = dataset.description

        # Convert all values to native Python types for JSON serialization
        column_insights = {
            k: {ik: (iv.item() if hasattr(iv, "item") else iv) for ik, iv in v.items()}
            for k, v in column_insights.items()
        }
        graph_plots = []
        for column in metadata:
            if column["type"] not in ["number", "float"]:
                unique_values = df[column["name"]].nunique()
                if unique_values > 20: 
                    value_counts = paginate_df[column["name"]].value_counts()
                else:
                    value_counts = df[column["name"]].value_counts()
                graph_plots.append(
                    {
                        column["name"]: {
                            "xlabel": value_counts.index.tolist(),
                            "ylabel": value_counts.values.tolist(),
                        }
                    }
                )
            else:
                unique_values = df[column["name"]].nunique()
                df[column["name"]] = df[column["name"]].replace([np.inf, -np.inf], np.nan)
                
                if unique_values <= 10:
                    # If less than or equal to 10 unique values, count occurrences
                    value_counts = df[column["name"]].value_counts()
                    graph_plots.append(
                        {
                            column["name"]: {
                                "xlabel": value_counts.index.tolist(),
                                "ylabel": value_counts.values.tolist(),
                            }
                        }
                    )
                else:
                    column = column['name']
                    mean = df[column].mean()
                    std_dev = df[column].std()
                    bins = [mean - 3*std_dev, mean - 2*std_dev, mean - std_dev,
                        mean, mean + std_dev, mean + 2*std_dev, mean + 3*std_dev]

                    # Create xLabel and yLabel
                    xLabel = [
                        f"{round(bins[i], 2)}-{round(bins[i + 1], 2)}"
                        for i in range(len(bins) - 1)
                    ]
                    yLabel = [
                        len(df[(df[column] >= bins[i]) & (df[column] < bins[i + 1])])
                        for i in range(len(bins) - 1)
                    ]
                    graph_plots.append(
                        {
                            column: {
                                "xlabel": xLabel,
                                "ylabel": yLabel,
                            }
                        }
                    )

        return {
            "dataset_name": dataset_name,
            "data_set_size": file_size,
            "column_insights": column_insights,
            "description": data_description,
            "graph_plots": graph_plots,
        }
        

    def get_dataset_column_info(self,workspace_id, dataset_id,isProcessed):
        if isProcessed:
            dataset = (
                self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id).first()
            )
        else:
            dataset = (
                self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
            )
            
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found",
            )
        data_explorer = DataExplorer(dataset.data)
        column_details = data_explorer.find_data_types()
        return column_details
    
    def get_correlation_matrix(self, workspace_id, dataset_id):
        dataset = (
            self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
        )
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found",
            )

        data_explore = DataExplorer(dataset.data)
        df = data_explore.get_df()

        # Replace empty strings with NaN
        df.replace("", pd.NA, inplace=True)

        # Select only numerical columns for correlation
        numerical_df = df.select_dtypes(include=['number'])

        # Calculate correlation matrix for numerical data
        correlation_matrix = numerical_df.corr()

        # Convert the correlation matrix to a list of dictionaries
        correlation_matrix_list = correlation_matrix.reset_index().rename(columns={"index": ""}).to_dict(orient="records")

        return correlation_matrix_list


    def handle_missing_value(self,workspace_id, dataset_id: int, handleType: str):
        dataset = (
            self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
        )

        wname = (
            self.db.query(WorkspaceModel)
            .filter(WorkspaceModel.id == dataset.workspace_id)
            .first()
            .name
        )

        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found",
            )

        data_explore = DataExplorer(dataset.data)
        df = data_explore.get_df()

        df.replace("", pd.NA, inplace=True)

        # if no null value raise error
        if df.isnull().sum().sum() == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No missing values in dataset",
            )

        # Separate numerical and categorical columns
        numerical_columns = df.select_dtypes(include=["number"]).columns
        categorical_columns = df.select_dtypes(exclude=["number"]).columns

        if handleType == "mean":
            df[numerical_columns] = df[numerical_columns].fillna(
                df[numerical_columns].mean()
            )
        elif handleType == "median":
            df[numerical_columns] = df[numerical_columns].fillna(
                df[numerical_columns].median()
            )
        elif handleType == "most_occurred":
            for column in df.columns:
                df[column].fillna(df[column].mode()[0], inplace=True)
        elif handleType == "drop":
            df.dropna(inplace=True)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid handle type",
            )

        if handleType == "drop":
            df.dropna(subset=categorical_columns, inplace=True)
        else:
            for column in categorical_columns:
                df[column].fillna(df[column].mode()[0], inplace=True)

        converted_data = df.to_dict(orient="records")

        # Update the dataset
        updated_dataset = pd.DataFrame(converted_data)
        self.b2_filemanager.write_file(updated_dataset, dataset.data, 'csv')

        processed_data_path = f"{self.current_user.id}/{wname}/datasets/{dataset.id}/{dataset.name}"
        self.b2_filemanager.write_file(updated_dataset, processed_data_path, 'csv')

        dataset.updated_by = self.current_user.id
        dataset.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(dataset)
        return {"message": "Missing values in dataset handled successfully"}
    


    def create_dataset_from_url(self,
        workspace_id,
        name,
        description,
        url,
        headers,
    ):
        # Check workspace validity or set default
        if workspace_id == 0 or not workspace_id:
            workspace = (
                self.db.query(WorkspaceModel)
                .filter(
                    WorkspaceModel.created_by == self.current_user.id,
                    WorkspaceModel.name == "Default Workspace",
                    WorkspaceModel.is_deleted == False
                )
                .first()
            )
            if not workspace:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Default workspace not found",
                )
            wid = workspace.id
            wname = workspace.name
        else:
            workspace = (
                self.db.query(WorkspaceModel)
                .filter(
                    WorkspaceModel.id == workspace_id,
                    WorkspaceModel.is_deleted == False
                )
                .first()
            )
            wid = workspace_id
            wname = workspace.name

        # Check dataset count limit
        dataset_count = (
            self.db.query(DatasetModel)
            .filter(DatasetModel.workspace_id == wid, DatasetModel.is_deleted == False)
            .count()
        )
        if dataset_count >= 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have exceeded the maximum limit of datasets. If you need more, please contact support.",
            )


        # Check for existing dataset with the same name
        existing_dataset = self._query_non_deleted_dataset(name=name, workspace_id=wid)
        if existing_dataset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dataset with this name already exists",
            )
        

        # Fetch data from the external API
        api_data = URLToDataFrame(url, headers)
        dataset_df = api_data.to_dataframe()
        dataset_df.replace("", np.nan, inplace=True)
        threshold = 0.6 * len(dataset_df)
        #if any col have more than 60% null value or '' then drop that column
        dataset_df = dataset_df.dropna(thresh=threshold, axis=1)
        
        # Save data to B2 (or your chosen file manager) as CSV
        data_path = f"{self.current_user.id}/{wname}/datasets/{name}"
        self.b2_filemanager.write_file(dataset_df, data_path, 'csv')

        # Create new dataset record
        new_dataset = DatasetModel(
            name=name,
            description=description,
            data=data_path,
            workspace_id=wid,
            is_api_data=True,
            api_url=url,
            api_headers=headers,
            created_by=self.current_user.id,
        )

        self.db.add(new_dataset)
        self.db.commit()
        self.db.refresh(new_dataset)
        
        # Processed data handling
        processed_data_path = f"{self.current_user.id}/{wname}/datasets/{new_dataset.id}/{name}"
        self.b2_filemanager.write_file(dataset_df, processed_data_path, 'csv')
        
        cleaned_data = ProcessedDataModel(
            dataset_id=new_dataset.id,
            data=processed_data_path,
            version=1
        )
        self.db.add(cleaned_data)
        self.db.commit()

        # Response formatting
        response_data = {
            "id": new_dataset.id,
            "name": new_dataset.name,
            "description": new_dataset.description,
            "workspace_id": new_dataset.workspace_id,
            "updated_by": new_dataset.updated_by,
            "updated_at": new_dataset.updated_at,
            "created_at": new_dataset.created_at,
            "created_by": {
                "id": new_dataset.creator.id,
                "name": new_dataset.creator.name,
                "email": new_dataset.creator.email,
                "picture": new_dataset.creator.picture,
            } if new_dataset.creator else None
        }

        return response_data
    
    def refresh_api_data(self, workspace_id, dataset_id, refresh_period=None):
        dataset = (
            self.db.query(DatasetModel)
            .filter(DatasetModel.id == dataset_id, DatasetModel.is_deleted == False)
            .first()
        )
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        if not dataset.is_api_data:
            raise HTTPException(status_code=400, detail="Dataset is not an API data source")

        # Update the refresh period if provided
        if refresh_period is not None and refresh_period > 0:
            dataset.refresh_period = refresh_period
            self.db.commit()
        
        # Fetch data from the external API
        api_data = URLToDataFrame(dataset.api_url, dataset.api_headers)
        dataset_df = api_data.to_dataframe()
        dataset_df.replace("", np.nan, inplace=True)
        threshold = 0.6 * len(dataset_df)
        dataset_df = dataset_df.dropna(thresh=threshold, axis=1)
        
        # Save to B2
        data_path = dataset.data
        self.b2_filemanager.write_file(dataset_df, data_path, 'csv')

        # Update the last refresh timestamp
        dataset.updated_at = datetime.now()
        self.db.commit()

        return {"message": "API data refreshed successfully"}

