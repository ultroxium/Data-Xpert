import pandas as pd
import numpy as np

class DataFrameCleaner:
    def __init__(self, df):
        self.df = df.copy()  # Ensuring that we don't modify the original DataFrame

    # Remove specified columns from the DataFrame
    def remove_columns(self, columns):
        self.df.drop(columns=[col for col in columns if col in self.df.columns], inplace=True, errors='ignore')
        return self

    # Fill missing and infinite values based on column data types (mean for numeric, mode for categorical)
    def fill_missing(self, strategy='mean',columns=None, fill_value=None):
        for col in columns:
            # Replace inf/-inf with NaN for easier handling
            self.df[col].replace([np.inf, -np.inf], np.nan, inplace=True)

            if self.df[col].isnull().any():
                if strategy == 'mean' and pd.api.types.is_numeric_dtype(self.df[col]):
                    self.df[col].fillna(self.df[col].mean(), inplace=True)
                elif strategy == 'median' and pd.api.types.is_numeric_dtype(self.df[col]):
                    self.df[col].fillna(self.df[col].median(), inplace=True)
                elif strategy == 'mode':
                    self.df[col].fillna(self.df[col].mode()[0], inplace=True)
                elif strategy == 'constant' and fill_value is not None:
                    self.df[col].fillna(fill_value, inplace=True)
                elif strategy == 'frequent' and pd.api.types.is_object_dtype(self.df[col]):
                    self.df[col].fillna(self.df[col].value_counts().index[0], inplace=True)
        return self

    # Drop rows or columns with missing values
    def drop_missing(self, axis=0, threshold=None):
        if threshold:
            self.df.dropna(axis=axis, thresh=threshold, inplace=True)
        else:
            self.df.dropna(axis=axis, inplace=True)
        return self

    # Remove duplicate rows from the DataFrame
    def remove_duplicates(self, subset=None):
        self.df.drop_duplicates(subset=subset, inplace=True)
        return self

    # Convert columns to appropriate data types (e.g., date, numeric)
    def convert_dtypes(self, conversions):
        for col, dtype in conversions.items():
            if col in self.df.columns:
                try:
                    self.df[col] = self.df[col].astype(dtype)
                except ValueError:
                    print(f"Could not convert {col} to {dtype}")
        return self

    # Strip leading/trailing whitespace from string columns
    def clean_strings(self):
      for col in self.df.select_dtypes(include='object').columns:
          self.df[col] = self.df[col].fillna('').str.strip()  # Handle NaN/None values and strip strings
          self.df[col].replace('', pd.NA, inplace=True)       # Optionally revert empty strings back to NaN
      return self

    # Get the cleaned DataFrame
    def get_dataframe(self):
        return self.df
