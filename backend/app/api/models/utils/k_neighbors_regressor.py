import ast
import json
import uuid
from fastapi import HTTPException, status
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.inspection import permutation_importance

from app.api.feature_engineering.model import ProcessedDataModel
from app.api.models.model import AIModel

class KNeighborsRegressorModel:
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
        
        # Store feature names for importance
        self.X = X
        y = self.df[self.target_column]
        
        # Scale the features (important for KNN)
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        self.X_scaled = pd.DataFrame(X_scaled, columns=X.columns)
        
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X_scaled, y, test_size=0.2, random_state=42
        )

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
        
        meta_data = processed_dataset.data_metadata
        
        if not meta_data:
            return encoders_path

        target_col_clean = self.target_column.replace(' ', '_').replace('/', '_').lower()
        return encoders_path + f'scaler_{target_col_clean}.pkl'

    def train(self, model_name='knn_model.pkl', n_neighbors=5, weights='uniform', 
              algorithm='auto', leaf_size=30, p=2):
        """
        Train the KNN regression model.
        
        Parameters:
        - n_neighbors: Number of neighbors to use
        - weights: Weight function used ('uniform' or 'distance')
        - algorithm: Algorithm used to compute nearest neighbors
        - leaf_size: Leaf size passed to BallTree or KDTree
        - p: Power parameter for the Minkowski metric (p=2 is Euclidean distance)
        """
        # Check if all features are numeric
        if not self.X.apply(lambda s: pd.to_numeric(s, errors='coerce').notnull().all()).all():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="All columns should be numeric to train the model."
            )

        # Initialize and train the model
        model = KNeighborsRegressor(
            n_neighbors=n_neighbors,
            weights=weights,
            algorithm=algorithm,
            leaf_size=leaf_size,
            p=p,
            n_jobs=-1  # Use all available cores
        )
        model.fit(self.X_train, self.y_train)
        self.model = model

        # Save the trained model and scaler
        model_path = self.model_path + model_name
        scaler_path = self.model_path + 'scaler.pkl'
        self.b2_filemanager.write_file(self.model, model_path, 'model')
        self.b2_filemanager.write_file(self.scaler, scaler_path, 'model')

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

    def get_feature_importance(self):
        """Calculate feature importance using permutation importance."""
        result = permutation_importance(
            self.model, self.X_test, self.y_test,
            n_repeats=10,
            random_state=42
        )
        
        importance_scores = result.importances_mean
        importance_stds = result.importances_std
        
        return importance_scores, importance_stds

    def get_neighbor_distances(self, X_sample):
        """Get distances to k nearest neighbors for a sample."""
        distances, _ = self.model.kneighbors(X_sample.reshape(1, -1))
        return distances[0]

    def evaluate(self):
        if not hasattr(self, 'model'):
            raise ValueError("Model has not been trained or loaded. Call 'train()' or 'load_model()' first.")

        # Make predictions
        y_pred = self.model.predict(self.X_test)
        
        # Calculate metrics
        mse = mean_squared_error(self.y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(self.y_test, y_pred)
        r2 = r2_score(self.y_test, y_pred)
        
        # Calculate feature importance
        importance_scores, importance_stds = self.get_feature_importance()
        
        # Create importance DataFrame
        importance_df = pd.DataFrame({
            'Feature': self.X.columns,
            'Importance': importance_scores,
            'Std': importance_stds
        })
        
        # Sort by importance in descending order
        importance_df = importance_df.sort_values('Importance', ascending=False)
        importance_df = importance_df.reset_index(drop=True)
        importance_df['Importance'] = importance_df['Importance'].apply(lambda x: round(x, 4))
        
        # Format importance for visualization
        importance_data = {
            "xlabel": importance_df['Feature'].tolist(),
            "ylabel": importance_df['Importance'].tolist(),
            "error_bars": importance_df['Std'].tolist()
        }

        # Calculate average neighbor distances
        avg_distances = []
        for idx in range(len(self.X_test)):
            distances = self.get_neighbor_distances(self.X_test.iloc[idx].values)
            avg_distances.append(np.mean(distances))

        # Create result dictionary
        result = {
            "mse": float(mse),
            "rmse": float(rmse),
            "mae": float(mae),
            "r2_score": float(r2),
            "importance": importance_data,
            "neighbor_stats": {
                "avg_distance": float(np.mean(avg_distances)),
                "min_distance": float(np.min(avg_distances)),
                "max_distance": float(np.max(avg_distances))
            },
            "actual_vs_predicted": {
                "actual": self.y_test.tolist(),
                "predicted": y_pred.tolist(),
                "avg_neighbor_distances": avg_distances
            }
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

    def analyze_neighbors(self, X_sample):
        """
        Analyze the nearest neighbors for a specific sample.
        Returns distances and indices of nearest neighbors.
        """
        if not hasattr(self, 'model'):
            raise ValueError("Model has not been trained or loaded. Call 'train()' or 'load_model()' first.")
            
        # Scale the input sample
        X_sample_scaled = self.scaler.transform(X_sample.reshape(1, -1))
        
        # Get neighbors
        distances, indices = self.model.kneighbors(X_sample_scaled)
        
        # Get the actual neighbor samples
        neighbor_samples = self.X_train.iloc[indices[0]]
        neighbor_targets = self.y_train.iloc[indices[0]]
        
        return {
            "distances": distances[0].tolist(),
            "neighbor_features": neighbor_samples.to_dict('records'),
            "neighbor_targets": neighbor_targets.tolist()
        }