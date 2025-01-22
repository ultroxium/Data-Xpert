import pandas as pd

# Function for data cleaning and transformation tasks
class DataCleaningTransformation:
    
    def __init__(self, df):
        self.df = df
    
    # Replace specific values in the DataFrame
    def replace_values(self, to_replace, value):
        return self.df.replace(to_replace, value)
    
    # Apply a function along a specified axis (0 for columns, 1 for rows)
    def apply_function(self, func, axis=0):
        return self.df.apply(func, axis=axis)
    
    # Apply a function element-wise
    def apply_elementwise(self, func):
        return self.df.applymap(func)
    
    # Map values of a Series based on an input correspondence (works on Series only)
    def map_values(self, column, mapping):
        self.df[column] = self.df[column].map(mapping)
        return self.df
    
    # Convert columns to a specified data type
    def convert_dtype(self, column, dtype):
        self.df[column] = self.df[column].astype(dtype)
        return self.df
    
    # Rename columns or rows
    def rename_columns(self, new_column_names):
        return self.df.rename(columns=new_column_names)
    
    # Find duplicated rows in the DataFrame
    def find_duplicates(self, subset=None, keep='first'):
        return self.df.duplicated(subset=subset, keep=keep)
    
    # Drop duplicate rows in the DataFrame
    def drop_duplicates(self, subset=None, keep='first'):
        return self.df.drop_duplicates(subset=subset, keep=keep)
    
    # Remove leading/trailing spaces from string columns
    def strip_whitespace(self, columns=None):
        if columns:
            self.df[columns] = self.df[columns].apply(lambda col: col.str.strip())
        else:
            self.df = self.df.apply(lambda col: col.str.strip() if col.dtypes == 'object' else col)
        return self.df

# Example Usage
# Assuming you already have a pandas DataFrame 'df' loaded from a CSV file
# df = pd.read_csv('your_data.csv')

# Instantiate the class
# cleaner = DataCleaningTransformation(df)

# Call methods for data cleaning and transformation
# cleaner.replace_values(to_replace='old_value', value='new_value')        # Replace values in DataFrame
# cleaner.apply_function(lambda x: x + 1, axis=0)                         # Apply a function along an axis
# cleaner.apply_elementwise(lambda x: x ** 2)                             # Apply function element-wise
# cleaner.map_values('column_name', {'old_value': 'new_value'})           # Map specific values in a column
# cleaner.convert_dtype('column_name', 'float')                           # Convert column data type
# cleaner.rename_columns({'old_col': 'new_col'})                          # Rename columns
# cleaner.find_duplicates()                                               # Find duplicate rows
# cleaner.drop_duplicates()                                               # Drop duplicate rows
# cleaner.strip_whitespace(['column_name'])                               # Remove leading/trailing spaces
