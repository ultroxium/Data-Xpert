import pandas as pd
import numpy as np
from statsmodels.tsa.stattools import adfuller

class TimeSeriesPreprocessor:
    def __init__(self, df, date_col, value_col):
        """
        Initializes the TimeSeriesPreprocessor with the dataset and necessary columns.
        
        :param df: The input DataFrame with time series data
        :param date_col: The name of the column containing dates or timestamps
        :param value_col: The name of the column containing the time series values
        """
        self.df = df
        self.date_col = date_col
        self.value_col = value_col
        self.df[self.date_col] = pd.to_datetime(self.df[self.date_col])
        self.df.set_index(self.date_col, inplace=True)
    
    def fill_missing(self, method='ffill'):
        """
        Fills missing values using the specified method.
        
        :param method: The method to fill missing values. Default is 'ffill' (forward fill).
                       Other options are 'bfill' (backward fill), 'linear', or 'interpolate'.
        """
        if method == 'ffill':
            self.df[self.value_col] = self.df[self.value_col].fillna(method='ffill')
        elif method == 'bfill':
            self.df[self.value_col] = self.df[self.value_col].fillna(method='bfill')
        elif method == 'linear':
            self.df[self.value_col] = self.df[self.value_col].interpolate(method='linear')
        elif method == 'interpolate':
            self.df[self.value_col] = self.df[self.value_col].interpolate()
    
    def check_stationarity(self):
        """
        Performs the Augmented Dickey-Fuller test to check if the time series is stationary.
        
        :return: A tuple (adf_statistic, p_value) indicating the stationarity status.
        """
        result = adfuller(self.df[self.value_col].dropna())
        adf_statistic, p_value = result[0], result[1]
        if p_value > 0.05:
            print("The time series is non-stationary (p-value > 0.05).")
        else:
            print("The time series is stationary (p-value <= 0.05).")
        return adf_statistic, p_value
    
    def create_lag_features(self, lags=1):
        """
        Creates lagged features to capture temporal dependencies in the data.
        
        :param lags: The number of lagged features to create. Default is 1 (i.e., the previous time step).
        """
        for lag in range(1, lags + 1):
            self.df[f'lag_{lag}'] = self.df[self.value_col].shift(lag)
    
    def extract_time_features(self):
        """
        Extracts time-based features from the datetime index (e.g., day, month, weekday).
        """
        self.df['year'] = self.df.index.year
        self.df['month'] = self.df.index.month
        self.df['day'] = self.df.index.day
        self.df['day_of_week'] = self.df.index.dayofweek
        self.df['quarter'] = self.df.index.quarter
        self.df['week_of_year'] = self.df.index.isocalendar().week
    
    def resample_data(self, frequency='D'):
        """
        Resamples the data to a different frequency (e.g., daily, monthly, etc.).
        
        :param frequency: The frequency to resample the data to. Default is 'D' (daily).
        """
        self.df = self.df.resample(frequency).mean()

    
    def get_processed_data(self):
        """
        Returns the processed DataFrame after all preprocessing steps.
        """
        return self.df

