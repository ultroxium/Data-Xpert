import ast
import json
import uuid
from fastapi import HTTPException, status
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.utils.multiclass import type_of_target

from app.api.feature_engineering.model import ProcessedDataModel
from app.api.models.model import AIModel

class KNNClassifierModel:
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
        self.scaler = StandardScaler()

        # Split data once during initialization
        X = self.df.drop(columns=[self.target_column] + self.ignore_columns)
        
        # Store feature names
        self.feature_names = X.columns.tolist()
        y = self.df[self.target_column]
        
        # Scale the features (important for KNN)
        X_scaled = self.scaler.fit_transform(X)
        self.X = pd.DataFrame(X_scaled, columns=X.columns)
        
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X, y, test_size=0.2, random_state=42
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
        
        encoder_types = {
            'label': f'label_encoder_{target_col_clean}.pkl',
            'ordinal': f'ordinal_encoder_{target_col_clean}.pkl',
            'binary': f'binary_encoder_{target_col_clean}.pkl',
            'one_hot': f'one_hot_encoder_{target_col_clean}.pkl'
        }

        return encoders_path + encoder_types.get(meta_data.get(self.target_column), '')

    def train(self, model_name='knn_classifier_model.pkl', 
              n_neighbors=5, weights='uniform', 
              metric='minkowski', p=2,
              algorithm='auto'):
        """
        Train a K-Nearest Neighbors classifier with specified parameters.
        
        Parameters:
        - n_neighbors: Number of neighbors to use (default: 5)
        - weights: Weight function used in prediction. Possible values:
            * 'uniform': All points in each neighborhood are weighted equally
            * 'distance': Points are weighted by the inverse of their distance
        - metric: Distance metric to use. Common options:
            * 'minkowski': Default metric (with p=2 it becomes Euclidean distance)
            * 'euclidean': Euclidean distance
            * 'manhattan': Manhattan distance
        - p: Power parameter for the Minkowski metric
        - algorithm: Algorithm used to compute nearest neighbors:
            * 'auto': Attempts to choose the best algorithm
            * 'ball_tree': BallTree algorithm
            * 'kd_tree': KDTree algorithm
            * 'brute': Brute-force search
        """
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
        model = KNeighborsClassifier(
            n_neighbors=n_neighbors,
            weights=weights,
            metric=metric,
            p=p,
            algorithm=algorithm
        )
        model.fit(self.X_train, self.y_train)
        self.model = model

        # Save the trained model and scaler
        model_path = self.model_path + model_name
        scaler_path = self.model_path + 'knn_scaler.pkl'
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
            input_columns=self.feature_names,
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
        
        # Calculate feature importance using distance-based importance
        importance_data = self._calculate_feature_importance()
        
        # Get class probabilities for each prediction
        y_prob = self.model.predict_proba(self.X_test)
        
        # Get neighbor analysis
        neighbor_analysis = self._analyze_neighbors()
        
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
            "neighbor_analysis": neighbor_analysis,
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

    def _calculate_feature_importance(self):
        """
        Calculate feature importance for KNN using a distance-based approach.
        Features that contribute more to the distance between points are considered more important.
        """
        from sklearn.inspection import permutation_importance
        
        # Use permutation importance as a measure of feature importance
        result = permutation_importance(
            self.model, self.X_test, self.y_test,
            n_repeats=10, random_state=42
        )
        
        importance = result.importances_mean
        
        # Create importance DataFrame
        importance_df = pd.DataFrame({
            'Feature': self.feature_names,
            'Importance': importance
        })
        
        # Sort by importance in descending order
        importance_df = importance_df.sort_values('Importance', ascending=False)
        importance_df = importance_df.reset_index(drop=True)
        importance_df['Importance'] = importance_df['Importance'].apply(lambda x: round(x, 4))
        
        return {
            "xlabel": importance_df['Feature'].tolist(),
            "ylabel": importance_df['Importance'].tolist()
        }

    def _analyze_neighbors(self):
        """
        Analyze the neighborhood characteristics of the model.
        """
        # Get nearest neighbors for test set
        distances, indices = self.model.kneighbors(self.X_test)
        
        # Calculate average distance to neighbors
        avg_distance = np.mean(distances, axis=1)
        
        # Calculate class distribution in neighborhoods
        neighborhood_diversity = []
        for idx in indices:
            neighbor_classes = self.y_train.iloc[idx].value_counts().to_dict()
            neighborhood_diversity.append(neighbor_classes)
        
        return {
            "average_neighbor_distance": float(np.mean(avg_distance)),
            "max_neighbor_distance": float(np.max(distances)),
            "min_neighbor_distance": float(np.min(distances)),
            "neighborhood_statistics": {
                "distances": {
                    "mean": float(np.mean(avg_distance)),
                    "std": float(np.std(avg_distance)),
                    "percentiles": {
                        "25": float(np.percentile(avg_distance, 25)),
                        "50": float(np.percentile(avg_distance, 50)),
                        "75": float(np.percentile(avg_distance, 75))
                    }
                }
            }
        }

    def predict_single(self, features):
        """
        Make prediction for a single instance with neighbor information.
        
        Parameters:
        features (dict): Dictionary of feature names and values
        
        Returns:
        dict: Prediction results including class, probabilities, and nearest neighbors
        """
        if not hasattr(self, 'model'):
            raise ValueError("Model has not been trained or loaded")
            
        # Convert features to DataFrame
        df = pd.DataFrame([features])
        
        # Ensure all required features are present
        missing_features = set(self.X.columns) - set(df.columns)
        if missing_features:
            raise ValueError(f"Missing features: {missing_features}")
        
        # Reorder columns to match training data
        df = df[self.X.columns]
        
        # Scale the features
        df_scaled = self.scaler.transform(df)
        
        # Make prediction
        prediction = self.model.predict(df_scaled)[0]
        probabilities = self.model.predict_proba(df_scaled)[0]
        
        # Get nearest neighbors
        distances, indices = self.model.kneighbors(df_scaled)
        
        # Get neighbor information
        neighbors = []
        for idx, dist in zip(indices[0], distances[0]):
            neighbors.append({
                "index": int(idx),
                "distance": float(dist),
                "class": str(self.y_train.iloc[idx])
            })
        
        return {
            "prediction": prediction,
            "probabilities": {
                str(self.model.classes_[i]): float(prob) 
                for i, prob in enumerate(probabilities)
            },
            "nearest_neighbors": neighbors
        }