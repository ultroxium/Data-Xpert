import pandas as pd

# Function for handling missing data tasks
class HandleMissingData:
    
    def __init__(self, df):
        self.df = df
    
    # Detect missing values (returns a DataFrame of booleans)
    def detect_missing(self):
        return self.df.isnull()
    
    # Detect non-missing values (returns a DataFrame of booleans)
    def detect_non_missing(self):
        return self.df.notnull()
    
    # Fill missing values with a specified value
    def fill_missing(self, value):
        return self.df.fillna(value)
    
    # Fill missing values with forward-fill method (propagates last valid observation)
    def forward_fill(self):
        return self.df.fillna(method='ffill')
    
    # Fill missing values with backward-fill method (propagates next valid observation)
    def backward_fill(self):
        return self.df.fillna(method='bfill')
    
    # Interpolate missing values (linear interpolation by default)
    def interpolate_missing(self, method='linear'):
        return self.df.interpolate(method=method)
    
    # Drop rows or columns with missing values
    def drop_missing(self, axis=0, how='any'):
        """
        axis=0: Drop rows with missing values
        axis=1: Drop columns with missing values
        how='any': Drop if any missing values
        how='all': Drop only if all values are missing
        """
        return self.df.dropna(axis=axis, how=how)

# Example Usage
# Assuming you already have a pandas DataFrame 'df' loaded from a CSV file
# df = pd.read_csv('your_data.csv')

# Instantiate the class
# missing_handler = HandleMissingData(df)

# Call methods for handling missing data
# missing_handler.detect_missing()              # Detect missing values (True/False)
# missing_handler.detect_non_missing()          # Detect non-missing values (True/False)
# missing_handler.fill_missing(0)               # Fill missing values with 0
# missing_handler.forward_fill()                # Forward fill missing values
# missing_handler.backward_fill()               # Backward fill missing values
# missing_handler.interpolate_missing()         # Interpolate missing values (linear by default)
# missing_handler.drop_missing(axis=0, how='any')  # Drop rows with any missing values
