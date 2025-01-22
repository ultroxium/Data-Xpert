import pandas as pd
import numpy as np
from scipy import stats


class OutlierHandler:
    def __init__(self, df):
        self.df = df

    def handle_z_score(self, columns, threshold=3):
        """Remove outliers using Z-Score method."""

        for column in columns:
            if pd.api.types.is_numeric_dtype(self.df[column]):
                z_scores = np.abs(stats.zscore(self.df[column]))
                self.df = self.df[z_scores < threshold]

        return self.df

    def handle_iqr(self, columns, iqr_factor=1.5):
        """Remove outliers using IQR (Interquartile Range) method."""
        for column in columns:
            if pd.api.types.is_numeric_dtype(self.df[column]):
                Q1 = self.df[column].quantile(0.25)
                Q3 = self.df[column].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - (iqr_factor * IQR)
                upper_bound = Q3 + (iqr_factor * IQR)

                self.df = self.df[(self.df[column] >= lower_bound) & (self.df[column] <= upper_bound)]

        return self.df

    def outlier_insights(self, columns, method='zscore', threshold=3, iqr_factor=1.5):
        """Show insights about outliers in the DataFrame.

        Args:
            columns (list): List of columns to check for outliers.
            method (str): The outlier detection method to use ('zscore' or 'iqr').
            threshold (float): Z-Score threshold for outliers. Default is 3.
            iqr_factor (float): Factor for IQR. Default is 1.5.

        Returns:
            dict: Dictionary containing insights about outliers.
        """
        from scipy import stats

        insights = {}
        for column in columns:
            if method == 'zscore':
                z_scores = np.abs(stats.zscore(self.df[column]))
                outliers = self.df[z_scores >= threshold][column]
                outlier_count = outliers.shape[0]
            elif method == 'iqr':
                Q1 = self.df[column].quantile(0.25)
                Q3 = self.df[column].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - (iqr_factor * IQR)
                upper_bound = Q3 + (iqr_factor * IQR)
                outliers = self.df[(self.df[column] < lower_bound) | (self.df[column] > upper_bound)][column]
                outlier_count = outliers.shape[0]
            else:
                raise ValueError("Invalid method. Choose either 'zscore' or 'iqr'.")

            insights[column] = {
                'outlier_count': outlier_count,
                'outlier_values': outliers.tolist()
            }

        return insights

