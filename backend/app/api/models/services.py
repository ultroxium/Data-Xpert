from fastapi import HTTPException,status
import pandas as pd
from sqlalchemy.orm import Session
from app.Helper.B2fileManager import B2FileManager
from app.Helper.check_permissions import PermissionCheck
from app.Helper.dataset_explore import DataExplorer
from app.api.datasets.model import DatasetModel
from app.api.feature_engineering.model import ProcessedDataModel
from app.api.feature_engineering.utils.encoder_decoder import DataDecoder, DataEncoder
from app.api.models.auto_ml.automl_model_factory import AUTOMLModelFactory
from app.api.models.model import AIModel, ModelListModel
from app.api.models.utils.linear_regression import LinearRegressionModel
from app.api.models.utils.logistic_regression import LogisticRegressionModel
from app.api.models.utils.model_factory import ModelFactory
from app.api.models.utils.random_forest_classifier import RandomForestClassifierModel
from app.api.models.utils.random_forest_regression import RandomForestRegressionModel


class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user
        self.permission_check = PermissionCheck(db, current_user)
        self.b2_filemanager = B2FileManager()
        self.model_factory = ModelFactory(db, self.b2_filemanager)



    def get_model(self, workspace_id: int, dataset_id: int):
        self.permission_check.check_view_access(workspace_id)
        
        # Perform a single query to join ProcessedDataModel and AIModel
        result = (
            self.db.query(ProcessedDataModel, AIModel)
            .join(AIModel, AIModel.processed_data_id == ProcessedDataModel.id)
            .filter(
                ProcessedDataModel.dataset_id == dataset_id,
                ProcessedDataModel.is_deleted == False,
                AIModel.is_deleted == False
            )
            .first()
        )

        
        # Handle case where no result is found
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset or Model not found")
        
        # Unpack the result into processed_dataset and model
        processed_dataset, model = result

        return model
    
    def get_model_lists(self, workspace_id: int, dataset_id: int,isbasic:bool=True):
        self.permission_check.check_view_access(workspace_id)
        list_of_models = self.db.query(ModelListModel).filter(ModelListModel.isbasic == isbasic).all()
        return list_of_models
    
    def delete_model(self, workspace_id: int, dataset_id: int, id: int):
        self.permission_check.check_edit_access(workspace_id)
        model = self.db.query(AIModel).filter(AIModel.id == id).first()
        if not model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
        
        model.is_deleted = True
        model.is_trained = False
        self.db.commit()
        return {
            "message": "Model deleted successfully"
        }


    
    def create_model(self, workspace_id: int, dataset_id: int, type: str, config: dict):
        self.permission_check.check_edit_access(workspace_id)
        #config = {'ignore_columns':['a','b'],'target_column':'target'}
        processed_dataset = self.db.query(ProcessedDataModel).filter(
            ProcessedDataModel.dataset_id == dataset_id,
            ProcessedDataModel.is_deleted == False
        ).first()

        data_explorer = DataExplorer(processed_dataset.data)
        columns= data_explorer.find_data_types()

        ignore_columns = config.get('ignore_columns', [])
        for column in columns:
            if column['name'] not in ignore_columns:
                if column["type"] != "number":
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All columns should be numeric to train the model. Either ignore the column or encode it.")

        return self.model_factory.create_model(type, dataset_id, config)
        
    def run_auto_ml(self, workspace_id: int, dataset_id: int, problem_type: str, config: dict):
        self.permission_check.check_edit_access(workspace_id)
        processed_dataset = self.db.query(ProcessedDataModel).filter(
        ProcessedDataModel.dataset_id == dataset_id,
        ProcessedDataModel.is_deleted == False
        ).first()
        
        data_explorer = DataExplorer(processed_dataset.data)
        columns = data_explorer.find_data_types()

        ignore_columns = config.get('ignore_columns', [])
        for column in columns:
            if column['name'] not in ignore_columns:
                if column["type"] != "number":
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All columns should be numeric to train the model. Either ignore the column or encode it.")

        automl_factory = AUTOMLModelFactory(self.db, self.b2_filemanager,processed_dataset.id)
        best_model_info = automl_factory.run_auto_ml(problem_type, dataset_id, config)
        
        if not best_model_info:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No suitable model found during AutoML.")
        
        return {
            "id": best_model_info["id"],
            "message": "Best model created successfully",
            "model_type": best_model_info["model_type"],
            "evaluation": best_model_info["evaluation"]
        }
        
    def predict(self, workspace_id: int, dataset_id: int, config: dict):
        # Check access permissions
        self.permission_check.check_view_access(workspace_id)

        #check config contain null or '' string
        if any([config[key] == '' for key in config.keys()]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please fill in all values to predict.")

        # Retrieve the processed dataset
        processed_dataset = self.db.query(ProcessedDataModel).filter(
            ProcessedDataModel.dataset_id == dataset_id,
            ProcessedDataModel.is_deleted == False
        ).first()
        
        if not processed_dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

        # Retrieve model data
        model_data = self.db.query(AIModel).filter(
            AIModel.processed_data_id == processed_dataset.id
        ).first()

        if not model_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found, please train a model first")

        # Load the encoder if available
        encoder = None
        if model_data.target_encoder_path.endswith('.pkl'):
            encoder = self.b2_filemanager.read_file(model_data.target_encoder_path, 'encoder')

        # Load the appropriate model based on model_id
        model_mapping = {
            1: "logistic_regression_model.pkl",
            3: "linear_regression_model.pkl",
            4: "random_forest_regression_model.pkl",
            5: "random_forest_classifier_model.pkl",
            6: "gradient_boosting_model.pkl",
            7: "svr_model.pkl",
            8: "knn_model.pkl",
            9: "ridge_regression_model.pkl",
            10: "elastic_net_regression_model.pkl",
            11: "svm_classifier_model.pkl",
            12: "gradient_boosting_classifier_model.pkl",
            13: "knn_classifier_model.pkl",
            14: "naive_bayes_classifier_model.pkl",
            15: "decision_tree_classifier_model.pkl"
        }
        model_file = model_mapping.get(model_data.model_id)
        if not model_file:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unsupported model type")
        
        model = self.b2_filemanager.read_file(f"{model_data.model_file_path}{model_file}", 'model')

        # Validate the new data
        new_data = pd.DataFrame([config])
        if new_data.isnull().values.any() or new_data.empty:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please fill in all values to predict.")

        try:
            # Encode the new data
            encoder_path = model_data.target_encoder_path
            all_encoder_path = "/".join(encoder_path.split("/")[:-1])

            data_encoder = DataEncoder(new_data, all_encoder_path, b2_filemanager=self.b2_filemanager, is_save_encoder=False)
            new_data = data_encoder.encode_data(processed_dataset.data_metadata, new_data)

            # Predict
            predictions = model.predict(new_data)
        except:
            predictions = model.predict(new_data)

        # Decode predictions if applicable
        if encoder and "label_encoder_" in model_data.target_encoder_path and model_data.target_encoder_path.endswith('.pkl'):
            predictions = encoder.inverse_transform(predictions)
        elif encoder and any(enc in model_data.target_encoder_path for enc in ["one_hot_encoder_", "ordinal_encoder_", "binary_encoder_"]) and model_data.target_encoder_path.endswith('.pkl'):
            predictions = encoder.inverse_transform(predictions.reshape(-1, 1))
        

        # Format result
        result = [{model_data.target_column: pred} for pred in predictions.tolist()]
        
        return result

    
    def get_input_columns(self, workspace_id: int, dataset_id: int):
        self.permission_check.check_view_access(workspace_id)
        processed_dataset_with_model = (
                self.db.query(ProcessedDataModel, AIModel)
                .join(AIModel, AIModel.processed_data_id == ProcessedDataModel.id)
                .filter(
                    ProcessedDataModel.dataset_id == dataset_id,
                    ProcessedDataModel.is_deleted == False,
                    AIModel.is_deleted == False
                )
                .first()
            )
        
        if not processed_dataset_with_model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found, please train a model first")
        
        processed_dataset, model = processed_dataset_with_model

        data = self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()

        target_column = model.target_column
        
        data_explorer = DataExplorer(data.data)
        columns= data_explorer.find_data_types()

        input_columns = model.input_columns

        columns = [x for x in columns if any(x['name'] in col for col in input_columns)]
        return columns



    
        

    
class PublicServices:
    def __init__(self, db: Session):
        self.db = db
        self.b2_filemanager = B2FileManager()
        self.model_factory = ModelFactory(db, self.b2_filemanager)

    def predict(self, workspace_id: int, dataset_id: int, config: dict):

        # Retrieve the processed dataset
        processed_dataset = self.db.query(ProcessedDataModel).filter(
            ProcessedDataModel.dataset_id == dataset_id,
            ProcessedDataModel.is_deleted == False
        ).first()
        
        if not processed_dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

        # Retrieve model data
        model_data = self.db.query(AIModel).filter(
            AIModel.processed_data_id == processed_dataset.id
        ).first()

        if not model_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

        # Load the encoder if available
        encoder = None
        if model_data.target_encoder_path.endswith('.pkl'):
            encoder = self.b2_filemanager.read_file(model_data.target_encoder_path, 'encoder')

        # Load the appropriate model based on model_id
        model_mapping = {
            1: "logistic_regression_model.pkl",
            3: "linear_regression_model.pkl",
            4: "random_forest_regression_model.pkl",
            5: "random_forest_classifier_model.pkl",
            6: "gradient_boosting_model.pkl",
            7: "svr_model.pkl",
            8: "knn_model.pkl",
            9: "ridge_regression_model.pkl",
            10: "elastic_net_regression_model.pkl",
            11: "svm_classifier_model.pkl",
            12: "gradient_boosting_classifier_model.pkl",
            13: "knn_classifier_model.pkl",
            14: "naive_bayes_classifier_model.pkl",
            15: "decision_tree_classifier_model.pkl"
        }
        model_file = model_mapping.get(model_data.model_id)
        if not model_file:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unsupported model type")
        
        model = self.b2_filemanager.read_file(f"{model_data.model_file_path}{model_file}", 'model')

        # Validate the new data
        new_data = pd.DataFrame([config])
        if new_data.isnull().values.any() or new_data.empty:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please fill in all values to predict.")

        try:
            # Encode the new data
            encoder_path = model_data.target_encoder_path
            all_encoder_path = "/".join(encoder_path.split("/")[:-1])

            data_encoder = DataEncoder(new_data, all_encoder_path, b2_filemanager=self.b2_filemanager, is_save_encoder=False)
            new_data = data_encoder.encode_data(processed_dataset.data_metadata, new_data)

            # Predict
            predictions = model.predict(new_data)
        except:
            predictions = model.predict(new_data)

        # Decode predictions if applicable
        if encoder and "label_encoder_" in model_data.target_encoder_path and model_data.target_encoder_path.endswith('.pkl'):
            predictions = encoder.inverse_transform(predictions)
        elif encoder and any(enc in model_data.target_encoder_path for enc in ["one_hot_encoder_", "ordinal_encoder_", "binary_encoder_"]) and model_data.target_encoder_path.endswith('.pkl'):
            predictions = encoder.inverse_transform(predictions.reshape(-1, 1))
        

        # Format result
        result = [{model_data.target_column: pred} for pred in predictions.tolist()]
        
        return result