from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from pyod.models.auto_encoder import AutoEncoder

class AnomalyModelFactory:
    def __init__(self, algorithm='isolation_forest'):
        self.algorithm = algorithm
        self.model = self._create_model()

    def _create_model(self):
        if self.algorithm == 'isolation_forest':
            return IsolationForest(contamination=0.1)
        elif self.algorithm == 'one_class_svm':
            return OneClassSVM(kernel='rbf', gamma='auto')
        elif self.algorithm == 'auto_encoder':
            return AutoEncoder(hidden_neurons=[64, 32, 32, 64], epochs=100, batch_size=32, contamination=0.1)
        else:
            raise ValueError(f"Unsupported algorithm: {self.algorithm}")

    def fit(self, X):
        self.model.fit(X)

    def predict(self, X):
        return self.model.predict(X)

    def fit_predict(self, X):
        return self.model.fit_predict(X)
