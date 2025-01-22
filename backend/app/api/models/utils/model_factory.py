from typing import Dict, Type
from fastapi import HTTPException, status
from app.api.models.model import ModelListModel
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

class ModelFactory:
    MODEL_REGISTRY = {
        'logistic_regression': (LogisticRegressionModel, 'logistic_regression'),
        'random_forest_regression': (RandomForestRegressionModel, 'random_forest_regression'),
        'linear_regression': (LinearRegressionModel, 'linear_regression'),
        'random_forest_classifier': (RandomForestClassifierModel, 'random_forest_classifier'),
        'gradient_boosting_regression': (GradientBoostingRegressionModel, 'gradient_boosting_regression'),
        'support_vector_regression': (SupportVectorRegressionModel, 'support_vector_regression'),
        'k_neighbors_regressor': (KNeighborsRegressorModel, 'k_neighbors_regressor'),
        'ridge_regression': (RidgeRegressionModel, 'ridge_regression'),
        'elastic_net_regression': (ElasticNetRegressionModel, 'elastic_net_regression'),
        'suppor_vector_machine': (SVMClassifierModel, 'suppor_vector_machine'),
        'gradient_boosting_classifier': (GradientBoostingClassifierModel, 'gradient_boosting_classifier'),
        'k_neighbors_classifier': (KNNClassifierModel, 'k_neighbors_classifier'),
        'naive_bayes_classifier': (NaiveBayesClassifierModel, 'naive_bayes_classifier'),
        'decision_tree_classifier': (DecisionTreeClassifierModel, 'decision_tree_classifier'),
    }

    def __init__(self, db, b2_filemanager):
        self.db = db
        self.b2_filemanager = b2_filemanager

    def create_model(self, model_type: str, dataset_id: int, config: Dict, model_list_id: int = None):
        if model_type not in self.MODEL_REGISTRY:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unknown model type: {model_type}"
            )

        model_class, model_key = self.MODEL_REGISTRY[model_type]
        
        if not model_list_id:
            model_list = self.db.query(ModelListModel).filter(
                ModelListModel.key == model_key
            ).first()
            
            if not model_list:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Model configuration not found for {model_type}"
                )
            model_list_id = model_list.id

        model = model_class(
            db=self.db,
            b2_filemanager=self.b2_filemanager,
            dataset_id=dataset_id,
            ignore_columns=config.get('ignore_columns', []),
            target_column=config.get('target_column'),
            model_id=model_list_id
        )

        model.train()
        evaluation, id = model.evaluate()

        return {
            "id": id,
            "message": "Model created successfully",
            "evaluation": evaluation
        }