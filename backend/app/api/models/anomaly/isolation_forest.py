from sklearn.ensemble import IsolationForest

class IsolationForestModel:
    def __init__(self, n_estimators=100, contamination=0.1, max_samples='auto', random_state=None):
        """
        Initializes the IsolationForestModel with the specified parameters.
        
        :param n_estimators: The number of base estimators in the ensemble.
        :param contamination: The proportion of outliers in the data set.
        :param max_samples: The number of samples to draw from X to train each base estimator.
        :param random_state: Controls the randomness of the estimator.
        """
        self.model = IsolationForest(n_estimators=n_estimators, contamination=contamination, 
                                     max_samples=max_samples, random_state=random_state)
    
    def fit(self, X):
        """
        Fits the Isolation Forest model to the data.
        
        :param X: The input data to fit the model.
        """
        self.model.fit(X)
    
    def predict(self, X):
        """
        Predicts the anomaly scores for the input data.
        
        :param X: The input data to predict.
        :return: The predicted anomaly scores.
        """
        return self.model.predict(X)
    
    def fit_predict(self, X):
        """
        Fits the model to the data and returns the anomaly scores.
        
        :param X: The input data to fit and predict.
        :return: The predicted anomaly scores.
        """
        return self.model.fit_predict(X)
    
    def decision_function(self, X):
        """
        Computes the anomaly score of each sample.
        
        :param X: The input data to compute the anomaly score.
        :return: The anomaly score of each sample.
        """
        return self.model.decision_function(X)
