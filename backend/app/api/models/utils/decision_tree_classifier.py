import ast
import json
import uuid
from fastapi import HTTPException, status
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.utils.multiclass import type_of_target

from app.api.feature_engineering.model import ProcessedDataModel
from app.api.models.model import AIModel

class DecisionTreeClassifierModel:
    def __init__(self, db, b2_filemanager, dataset_id, ignore_columns, target_column, model_id=None):
        self.db = db
        self.b2_filemanager = b2_filemanager
        self.dataset_id = dataset_id
        self.df = self.get_df()
        self.ignore_columns = ignore_columns
        self.target_column = target_column
        self.model_id = model_id
        self.model_path = self.get_model_path()
        self.target_encoder_path = self.get_target_encoder_path()

        # Split data once during initialization
        X = self.df.drop(columns=[self.target_column] + self.ignore_columns)
        
        # Store features for importance
        self.X = X
        y = self.df[self.target_column]
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    def get_df(self):
        processed_dataset = self.db.query(ProcessedDataModel).filter(
            ProcessedDataModel.dataset_id == self.dataset_id, 
            ProcessedDataModel.is_deleted == False
        ).first()
        if not processed_dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Dataset not found"
            )
        
        df = self.b2_filemanager.read_file(processed_dataset.data, 'csv')
        self.processed_data_id = processed_dataset.id
        return df
    
    def get_model_path(self):
        processed_dataset = self.db.query(ProcessedDataModel).filter(
            ProcessedDataModel.dataset_id == self.dataset_id, 
            ProcessedDataModel.is_deleted == False
        ).first()
        if not processed_dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Dataset not found"
            )
        original_path = processed_dataset.data
        return original_path.split(f'{processed_dataset.dataset_id}/')[0] + f'{processed_dataset.dataset_id}/models/'
    
    def get_target_encoder_path(self):
        processed_dataset = self.db.query(ProcessedDataModel).filter(
            ProcessedDataModel.dataset_id == self.dataset_id, 
            ProcessedDataModel.is_deleted == False
        ).first()
        if not processed_dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Dataset not found"
            )
        original_path = processed_dataset.data
        encoders_path = original_path.split(f'{processed_dataset.dataset_id}/')[0] + f'{processed_dataset.dataset_id}/encoders/'

        # Check target column in encode_columns and find type
        meta_data = processed_dataset.data_metadata
        
        if not meta_data:
            return encoders_path

        target_col_clean = self.target_column.replace(' ', '_').replace('/', '_').lower()
        
        encoder_types = {
            'label': f'label_encoder_{target_col_clean}.pkl',
            'ordinal': f'ordinal_encoder_{target_col_clean}.pkl',
            'binary': f'binary_encoder_{target_col_clean}.pkl',
            'one_hot': f'one_hot_encoder_{target_col_clean}.pkl'
        }

        return encoders_path + encoder_types.get(meta_data.get(self.target_column), '')

    def train(self, model_name='decision_tree_classifier_model.pkl', max_depth=None, min_samples_split=2, 
             min_samples_leaf=1, criterion='gini'):
        target_type = type_of_target(self.y_train)
        if target_type not in ['binary', 'multiclass']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Target column should be binary or multiclass to train the model."
            )
        
        # Check if all features are numeric
        if not self.X.apply(lambda s: pd.to_numeric(s, errors='coerce').notnull().all()).all():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="All columns should be numeric to train the model."
            )

        # Initialize and train the model
        model = DecisionTreeClassifier(
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            criterion=criterion,
            random_state=42
        )
        model.fit(self.X_train, self.y_train)
        self.model = model

        # Save the trained model
        model_path = self.model_path + model_name
        self.b2_filemanager.write_file(self.model, model_path, 'model')

        # Update database
        existing_models = self.db.query(AIModel).filter(
            AIModel.processed_data_id == self.processed_data_id
        ).all()
        
        if existing_models:
            for model in existing_models:
                self.db.delete(model)
            self.db.commit()

        # Create new model entry
        new_model = AIModel(
            processed_data_id=self.processed_data_id,
            target_column=self.target_column,
            target_encoder_path=self.target_encoder_path,
            name=uuid.uuid4(),
            model_id=self.model_id,
            model_file_path=self.get_model_path(),
            input_columns=self.X.columns.tolist(),
            is_trained=True
        )
        self.db.add(new_model)
        self.db.commit()

        return self.model

    def evaluate(self):
        if not hasattr(self, 'model'):
            raise ValueError("Model has not been trained or loaded. Call 'train()' or 'load_model()' first.")

        # Make predictions
        y_pred = self.model.predict(self.X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(self.y_test, y_pred)
        confusion = confusion_matrix(self.y_test, y_pred).tolist()
        report = classification_report(self.y_test, y_pred, output_dict=True)
        
        # Get feature importance
        importance = self.model.feature_importances_
        
        # Create a DataFrame to store feature names and their importance values
        importance_df = pd.DataFrame({
            'Feature': self.X.columns,
            'Importance': importance
        })
        
        # Sort by importance in descending order
        importance_df = importance_df.sort_values('Importance', ascending=False)
        
        # Reset the index and round the importance values
        importance_df = importance_df.reset_index(drop=True)
        importance_df['Importance'] = importance_df['Importance'].apply(lambda x: round(x, 4))
        
        # Format importance for visualization
        importance_data = {
            "xlabel": importance_df['Feature'].tolist(),
            "ylabel": importance_df['Importance'].tolist()
        }

        # Get class probabilities for each prediction
        y_prob = self.model.predict_proba(self.X_test)
        
        # Create result dictionary
        result = {
            "accuracy": float(accuracy),
            "confusion_matrix": confusion,
            "classification_report": report,
            "importance": importance_data,
            "actual_vs_predicted": {
                "actual": self.y_test.tolist(),
                "predicted": y_pred.tolist(),
                "probabilities": y_prob.tolist()
            },
            "classes": self.model.classes_.tolist()
        }

        # Update model metadata in database
        existing_model = self.db.query(AIModel).filter(
            AIModel.processed_data_id == self.processed_data_id,
            AIModel.is_deleted == False
        ).first()

        if not existing_model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )

        id = existing_model.id
        existing_model.model_metadata = result
        self.db.commit()

        return result, id