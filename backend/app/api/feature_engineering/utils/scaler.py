import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler, MaxAbsScaler, RobustScaler

class ScalingData:
    def __init__(self, df):
        self.df = df

    def apply_standard_scaler(self, columns=None):
        """Apply StandardScaler to the specified columns."""
        scaler = StandardScaler()
        if columns is None:
            self.df = pd.DataFrame(scaler.fit_transform(self.df), columns=self.df.columns)
        else:
            self.df[columns] = scaler.fit_transform(self.df[columns])
        return self.df

    def apply_min_max_scaler(self, columns=None, feature_range=(0, 1)):
        """Apply MinMaxScaler to the specified columns."""
        scaler = MinMaxScaler(feature_range=feature_range)
        if columns is None:
            self.df = pd.DataFrame(scaler.fit_transform(self.df), columns=self.df.columns)
        else:
            self.df[columns] = scaler.fit_transform(self.df[columns])
        return self.df

    def apply_max_abs_scaler(self, columns=None):
        """Apply MaxAbsScaler to the specified columns."""
        scaler = MaxAbsScaler()
        if columns is None:
            self.df = pd.DataFrame(scaler.fit_transform(self.df), columns=self.df.columns)
        else:
            self.df[columns] = scaler.fit_transform(self.df[columns])
        return self.df

    def apply_robust_scaler(self, columns=None, quantile_range=(25.0, 75.0)):
        """Apply RobustScaler to the specified columns."""
        scaler = RobustScaler(quantile_range=quantile_range)
        if columns is None:
            self.df = pd.DataFrame(scaler.fit_transform(self.df), columns=self.df.columns)
        else:
            self.df[columns] = scaler.fit_transform(self.df[columns])
        return self.df
