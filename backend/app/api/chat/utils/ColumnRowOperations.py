import pandas as pd

# Function for column and row operations
class ColumnRowOperations:
    
    def __init__(self, df):
        self.df = df
    
    # Add a new column with a specific value or based on a function
    def add_column(self, column_name, value):
        self.df[column_name] = value
        return self.df
    
    # Remove one or more columns
    def remove_columns(self, columns):
        return self.df.drop(columns=columns)
    
    # Add a new row (data should be a dictionary or list-like)
    def add_row(self, row_data):
        new_row = pd.DataFrame([row_data], columns=self.df.columns)
        self.df = pd.concat([self.df, new_row], ignore_index=True)
        return self.df
    
    # Remove rows by index or condition
    def remove_rows(self, index=None, condition=None):
        if condition is not None:
            self.df = self.df.drop(self.df[condition].index)
        elif index is not None:
            self.df = self.df.drop(index)
        return self.df
    
    # Sort DataFrame by one or more columns
    def sort_by_columns(self, columns, ascending=True):
        return self.df.sort_values(by=columns, ascending=ascending)
    
    # Group data by a column and apply aggregation functions
    def group_by(self, by_column, agg_func):
        return self.df.groupby(by_column).agg(agg_func)
    
    # Transpose DataFrame (swap rows and columns)
    def transpose(self):
        return self.df.transpose()
    
    # Apply function to a specific column
    def apply_to_column(self, column_name, func):
        self.df[column_name] = self.df[column_name].apply(func)
        return self.df
    
    # Apply function to a specific row (row by index)
    def apply_to_row(self, row_index, func):
        self.df.loc[row_index] = self.df.loc[row_index].apply(func)
        return self.df

# Example Usage
# Assuming you already have a pandas DataFrame 'df' loaded from a CSV file
# df = pd.read_csv('your_data.csv')

# Instantiate the class
# col_row_ops = ColumnRowOperations(df)

# Call methods for column and row operations
# col_row_ops.add_column('new_column', value=0)                          # Add a new column
# col_row_ops.remove_columns(['column1', 'column2'])                     # Remove columns
# col_row_ops.add_row({'col1': 1, 'col2': 2, 'col3': 3})                 # Add a new row
# col_row_ops.remove_rows(index=0)                                       # Remove row by index
# col_row_ops.sort_by_columns(['column1'], ascending=False)              # Sort by column
# col_row_ops.group_by('group_column', {'column1': 'mean', 'column2': 'sum'})  # Group by column and aggregate
# col_row_ops.transpose()                                                # Transpose DataFrame
# col_row_ops.apply_to_column('column_name', lambda x: x**2)             # Apply function to a column
# col_row_ops.apply_to_row(0, lambda x: x*2)                             # Apply function to a specific row
