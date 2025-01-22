from typing import Dict, Optional
from fastapi import HTTPException, status
from app.api.models.model import AIModel, ModelListModel
from app.api.models.utils.decision_tree_classifier import DecisionTreeClassifierModel
from app.api.models.utils.elastic_net_regression import ElasticNetRegressionModel
from app.api.models.utils.gradient_boosting_classifier import GradientBoostingClassifierModel
from app.api.models.utils.gradient_boosting_regression import GradientBoostingRegressionModel
from app.api.models.utils.k_neighbors_classifier import KNNClassifierModel
from app.api.models.utils.k_neighbors_regressor import KNeighborsRegressorModel
from app.api.models.utils.linear_regression import LinearRegressionModel
from app.api.models.utils.logistic_regression import LogisticRegressionModel
from app.api.models.utils.naive_bayes_classifier import NaiveBayesClassifierModel
from app.api.models.utils.random_forest_classifier import RandomForestClassifierModel
from app.api.models.utils.random_forest_regression import RandomForestRegressionModel
from app.api.models.utils.ridge_regression import RidgeRegressionModel
from app.api.models.utils.support_vector_machine import SVMClassifierModel
from app.api.models.utils.support_vector_regression import SupportVectorRegressionModel
from typing import Dict, Optional, Type, List
from fastapi import HTTPException, status

class AUTOMLModelFactory:
    MODEL_REGISTRY = {
        'classification': {
            'logistic_regression': LogisticRegressionModel,
            'gradient_boosting_classifier': GradientBoostingClassifierModel,
            'k_neighbors_classifier': KNNClassifierModel,
            'naive_bayes_classifier': NaiveBayesClassifierModel,
            'suppor_vector_machine': SVMClassifierModel,
            'decision_tree_classifier': DecisionTreeClassifierModel,
            'random_forest_classifier': RandomForestClassifierModel,
        },
        'regression': {
            'linear_regression': LinearRegressionModel,
            'random_forest_regression': RandomForestRegressionModel,
            'gradient_boosting_regression': GradientBoostingRegressionModel,
            'support_vector_regression': SupportVectorRegressionModel,
            'k_neighbors_regressor': KNeighborsRegressorModel,
            'ridge_regression': RidgeRegressionModel,
            'elastic_net_regression': ElasticNetRegressionModel,
        }
    }
    
    def __init__(self, db, b2_filemanager,processed_data_id):
        """Initialize the AutoML factory with database and file manager dependencies.

        Args:
            db: Database connection instance
            b2_filemanager: B2 file storage manager instance
        """
        self.db = db
        self.b2_filemanager = b2_filemanager
        self.processed_data_id = processed_data_id

    def run_auto_ml(self, problem_type: str, dataset_id: int, config: Dict) -> Optional[Dict]:
        if problem_type not in self.MODEL_REGISTRY:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown problem type for AutoML: {problem_type}"
            )
        
        target_column = config.get('target_column')
        if not target_column:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target column must be specified in config"
            )
            
        ignore_columns = config.get('ignore_columns', [])
        evaluations = []

        for model_type, model_class in self.MODEL_REGISTRY[problem_type].items():
            try:
                model_list = self.db.query(ModelListModel).filter(
                    ModelListModel.key == model_type
                ).first()
                
                if model_list is None:
                    print(f"Skipping {model_type}: Not found in model list")
                    continue
                
                model = model_class(
                    db=self.db,
                    b2_filemanager=self.b2_filemanager,
                    dataset_id=dataset_id,
                    ignore_columns=ignore_columns,
                    target_column=target_column,
                    model_id=model_list.id
                )

                model.train()
                evaluation, model_id = model.evaluate()

                # Append each evaluation with relevant info
                evaluations.append({
                    "id": model_id,
                    "model_type": model_type,
                    "evaluation": evaluation,
                    "model": model
                })

            except Exception as e:
                print(f"Error training {model_type}: {str(e)}")
                continue
                
        if not evaluations:
            return None

        # Determine the best model at the end
        key_metric = 'accuracy' if problem_type == 'classification' else 'r2_score'
        best_model_info = max(evaluations, key=lambda x: x['evaluation'].get(key_metric, 0))

        #update database with best model info
        existing_models = self.db.query(AIModel).filter(AIModel.processed_data_id == self.processed_data_id,AIModel.is_deleted == False).first()

        model_lists = self.db.query(ModelListModel).filter(
            ModelListModel.key == best_model_info['model_type']
        ).first()

        existing_models.model_id =model_lists.id
        existing_models.model_metadata = best_model_info['evaluation']
        self.db.commit()
        # Remove the model instance before returning
        model_info = best_model_info.copy()
        model_info.pop('model', None)
        return model_info