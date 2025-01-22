import json
from fastapi import HTTPException,status
import numpy as np
from sqlalchemy.orm import Session

from app.Helper.B2fileManager import B2FileManager
from app.Helper.check_permissions import PermissionCheck
from app.Helper.dataset_explore import DataExplorer
from app.api.datasets.model import DatasetModel
from app.api.feature_engineering.model import ProcessedDataModel
from app.api.feature_engineering.utils.auto_process import AutoProcess
from app.api.feature_engineering.utils.data_cleaner import DataFrameCleaner
from app.api.feature_engineering.utils.encoder_decoder import DataEncoder
from pandas.api.types import is_categorical_dtype,is_object_dtype

from app.api.feature_engineering.utils.outlier_handler import OutlierHandler
from app.api.feature_engineering.utils.scaler import ScalingData

class Status:
    CLEANED = "cleaned"
    ENCODED = "encoded"
    OUTLIER_HANDLED = "outlier_handled"
    NORMALIZED = "normalized"
    PROCESSED = "processed"

class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user
        self.permission_check = PermissionCheck(db, current_user)
        self.b2_filemanager = B2FileManager()

    def get_old_file_version(self, workspace_id: int, dataset_id: int):
        self.permission_check.check_view_access(workspace_id)
        processed_dataset = self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id, ProcessedDataModel.is_deleted==False).first()

        if not processed_dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        
        versions = self.b2_filemanager.delete_recent_file_versions(processed_dataset.data)
        processed_dataset.data_metadata=None
        self.db.commit()
        self.db.refresh(processed_dataset)
        return {
            "message": "Dataset reverted to previous version successfully.",
        }

    def get_data(self, workspace_id: int, dataset_id: int,limit:int, offset:int,query: str = None):
        self.permission_check.check_view_access(workspace_id)
        processed_dataset = self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id, ProcessedDataModel.is_deleted==False).first()

        if not processed_dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        
        df = self.b2_filemanager.read_file(processed_dataset.data,'csv')
        unformatted_raw_data= df.to_json(orient='records')
        raw_data = json.loads(unformatted_raw_data)

        if query:
            filtered_data = [
                item for item in raw_data if any(query.lower() in str(value).lower() for value in item.values())
            ]
        else:
            filtered_data = raw_data
        paginated_data = filtered_data[offset:offset+limit]

        result ={
            "data": paginated_data,
            "total": len(filtered_data),
            "limit": limit,
            "offset": offset
        }

        return result

    def clean_data(self, workspace_id: int, dataset_id: int, config: dict):
        self.permission_check.check_edit_access(workspace_id)
        processed_dataset = self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id, ProcessedDataModel.is_deleted==False).first()

        if not processed_dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        
        df = self.b2_filemanager.read_file(processed_dataset.data,'csv')
        cleaner = DataFrameCleaner(df)

        if 'remove_columns' in config:
            if len(df.columns) == 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove the only column in the dataset")
            cleaner.remove_columns(config.get('remove_columns', []))

        if 'fill_missing' in config:
            fill_config = config.get('fill_missing', {})
            cleaner.fill_missing(
                strategy=fill_config.get('strategy', 'mean'),
                columns=fill_config.get('columns', []),
                fill_value=fill_config.get('fill_value', None)
            )

        if 'drop_missing' in config:
            drop_config = config.get('drop_missing', {})
            cleaner.drop_missing(
                axis=drop_config.get('axis', 0),
                threshold=drop_config.get('threshold', None)
            )

        if 'remove_duplicates' in config:
            duplicates_config = config.get('remove_duplicates', {})
            cleaner.remove_duplicates(subset=duplicates_config.get('subset', None))

        if 'convert_dtypes' in config:
            convert_config = config.get('convert_dtypes', {})
            cleaner.convert_dtypes(conversions=convert_config.get('conversions', {}))

        if 'clean_strings' in config:
            cleaner.clean_strings()


        self.b2_filemanager.write_file(cleaner.get_dataframe(),processed_dataset.data,'csv')

        processed_dataset.status = Status.CLEANED
        self.db.commit()
        return {
            "message": "Data cleaning completed successfully"
        }
    
    def encode_data(self, workspace_id: int, dataset_id: int, config: dict):
        self.permission_check.check_edit_access(workspace_id)
        processed_dataset = self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id, ProcessedDataModel.is_deleted==False).first()

        # Load existing data from the data_metadata column
        existing_metadata = processed_dataset.data_metadata or {}

        # Make a copy of existing_metadata to avoid direct modification
        metadata_copy = existing_metadata.copy()

        def update_metadata(metadata, config):
            encode_columns = config.get("encode_columns", [])
            encoding_type = config.get("type", "")
            for column in encode_columns:
                metadata[column] = encoding_type
            return metadata

        # Update the copy, not the original
        updated_metadata = update_metadata(metadata_copy, config)

        # Assign the updated metadata to the dataset
        processed_dataset.data_metadata = updated_metadata


        df = self.b2_filemanager.read_file(processed_dataset.data,'csv')
        original_path = processed_dataset.data
        new_path = original_path.split(f'{processed_dataset.dataset_id}/')[0] + f'{processed_dataset.dataset_id}/encoders'
        encoder = DataEncoder(df,new_path,self.b2_filemanager)

        # Helper function to get categories for multiple columns
        def get_column_categories(column_names):
            categories = {}
            for column_name in column_names:
                if is_categorical_dtype(df[column_name]):
                    categories[column_name] = df[column_name].cat.categories.tolist()
                elif is_object_dtype(df[column_name]):
                    categories[column_name] = df[column_name].unique().tolist()
                else:
                    raise ValueError(f"Column {column_name} cannot be ordinal encoded as it is not categorical or object type.")
            return categories
        
        encoded=  df
        if 'encode_columns' in config:
            encode_config = config.get('encode_columns', [])
            if 'type' in config:
                encode_type = config.get('type')
                if encode_type == 'label':
                    encoded= encoder.label_encode(column_names=encode_config)
                elif encode_type == 'one_hot':
                    encoded= encoder.one_hot_encode(column_names=encode_config)
                elif encode_type == 'ordinal':
                    categories = get_column_categories(column_names=encode_config)
                    encoded= encoder.ordinal_encode(column_names=encode_config,categories=categories)
                elif encode_type == 'binary':
                    encoded= encoder.binary_encode(column_names=encode_config)

        self.b2_filemanager.write_file(encoded,processed_dataset.data,'csv')

        processed_dataset.status = Status.ENCODED
        self.db.commit()


        return {
            "message": "Data encoding completed successfully"
        }
    
    def handle_outliers(self, workspace_id: int, dataset_id: int, config: dict):
        self.permission_check.check_edit_access(workspace_id)
        processed_dataset = self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id, ProcessedDataModel.is_deleted==False).first()

        if not processed_dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
                
        df = self.b2_filemanager.read_file(processed_dataset.data,'csv')
        outlier_handler = OutlierHandler(df)

        if 'columns' in config:
            columns = config.get('columns', [])
            if 'method' in config:
                method = config.get('method')
                if method == 'zscore':
                    outlier_handler.handle_z_score(columns, threshold=config.get('threshold', 3))
                elif method == 'iqr':
                    outlier_handler.handle_iqr(columns, iqr_factor=config.get('iqr_factor', 1.5))
                else:
                    raise ValueError("Invalid method. Choose either 'zscore' or 'iqr'.")
                
        self.b2_filemanager.write_file(outlier_handler.df,processed_dataset.data,'csv')
        processed_dataset.status = Status.OUTLIER_HANDLED
        self.db.commit()

        return {
            "message": "Outlier handling completed successfully"
        }
    
    def normalize_data(self, workspace_id: int, dataset_id: int, config: dict):
        self.permission_check.check_edit_access(workspace_id)
        processed_dataset = self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id, ProcessedDataModel.is_deleted==False).first()

        if not processed_dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        
        df = self.b2_filemanager.read_file(processed_dataset.data,'csv')

        #check if the dataset has all column numeric
        if not df.select_dtypes(include=[np.number]).columns.equals(df.columns):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dataset must have all numeric columns before normalization")

        scaler = ScalingData(df)

        if 'normalize_columns' in config:
            normalize_config = config.get('normalize_columns', [])
            if 'type' in config:
                normalize_type = config.get('type')
                if normalize_type == 'standard':
                    scaled= scaler.apply_standard_scaler(columns=normalize_config)
                elif normalize_type == 'minmax':
                    scaled= scaler.apply_min_max_scaler(columns=normalize_config)
                elif normalize_type == 'maxabs':
                    scaled= scaler.apply_max_abs_scaler(columns=normalize_config)
                elif normalize_type == 'robust':
                    scaled= scaler.apply_robust_scaler(columns=normalize_config)

        self.b2_filemanager.write_file(scaled,processed_dataset.data,'csv')
        processed_dataset.status = Status.NORMALIZED
        self.db.commit()

        return {
            "message": "Data normalization completed successfully"
        }
    
    def get_suggestions(self, workspace_id: int, dataset_id: int,problem:str):
        dataset = self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id, ProcessedDataModel.is_deleted==False).first()

        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        
        explore = DataExplorer(dataset.data)
        if problem == 'regression':
            return explore.get_suggestions_for_regression_problem()
        elif problem == 'classification':
            return explore.get_suggestions_for_classification_problem()
        
    def get_distributions(self, workspace_id: int, dataset_id: int):
        dataset = self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id, ProcessedDataModel.is_deleted==False).first()

        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        
        df = self.b2_filemanager.read_file(dataset.data,'csv')
        explore = DataExplorer(dataset.data)
        columns = explore.find_data_types()

        distributions = []  

        for column_info in columns:
            column = column_info['name']
            if column_info['type'] == 'number':
                # Calculate mean and standard deviation
                mean = df[column].mean()
                std_dev = df[column].std()
                
                # Define bin edges using standard deviations
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

                # Append the distribution data for the current column
                distributions.append({
                    "column": column,
                    "xLabel": xLabel,
                    "yLabel": yLabel,
                })

        return distributions
    
    def get_correlation_matrix(self, workspace_id: int, dataset_id: int):
        dataset = self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id, ProcessedDataModel.is_deleted==False).first()

        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        
        df = self.b2_filemanager.read_file(dataset.data,'csv')

        if df.empty:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dataset is empty")
        explore = DataExplorer(dataset.data)
        columns = explore.find_data_types()

        numeric_columns = [column['name'] for column in columns if column['type'] == 'number']

        correlation_matrix = df[numeric_columns].corr(method='pearson')
        rounded_matrix = correlation_matrix.round(2)

        rounded_matrix.replace([np.inf, -np.inf], np.nan, inplace=True)
        rounded_matrix.fillna(0, inplace=True)

        xLabel = rounded_matrix.columns.tolist()
        yLabel = rounded_matrix.index.tolist()

        # Format data as dataList
        dataList = [
            [i, j, rounded_matrix.iloc[i, j]]
            for i in range(len(rounded_matrix))
            for j in range(len(rounded_matrix.columns))
        ]

        # Calculate max and min values
        max_value = rounded_matrix.values.max()
        min_value = rounded_matrix.values.min()

        result = {
            "data": dataList,
            "xLabel": xLabel,
            "yLabel": yLabel,
            "maxValue": max_value,
            "minValue": min_value,
        }

        return result
    
    def auto_process(self, workspace_id: int, dataset_id: int):
        self.permission_check.check_edit_access(workspace_id)
        processed_dataset = self.db.query(ProcessedDataModel).filter(ProcessedDataModel.dataset_id == dataset_id, ProcessedDataModel.is_deleted==False).first()

        if not processed_dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
        
        df = self.b2_filemanager.read_file(processed_dataset.data,'csv')
        explore = DataExplorer(processed_dataset.data)
        columns = explore.find_data_types()
        cleaner = AutoProcess(df,columns)
        processed_data =cleaner.process_data()
        self.b2_filemanager.write_file(processed_data,processed_dataset.data,'csv')
        processed_dataset.status = Status.PROCESSED
        self.db.commit()
        self.db.refresh(processed_dataset)

        new_explore = DataExplorer(processed_dataset.data)
        new_columns = new_explore.find_data_types()

        encode_config = {
            "encode_columns":[col["name"] for col in new_columns if col.get("type") == 'string'],
            "type":"label"
        }
        self.encode_data(workspace_id,dataset_id,encode_config)

        new_explore_ = DataExplorer(processed_dataset.data)
        new_columns_ = new_explore_.find_data_types()

        outlier_config = {
            "columns":[col["name"] for col in new_columns_ if col.get("type") == 'number'],
            "method":"zscore",
            "threshold":3
        }

        self.handle_outliers(workspace_id,dataset_id,outlier_config)

        return {
            "message": "Auto processing completed successfully"
        }
