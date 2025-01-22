class AutoProcess:
    def __init__(self, df, columns, missing_threshold: float = 0.5,
                 categorical_unique_threshold: int = 10,
                 outlier_threshold: float = 1.5):
        self.df = df
        self.columns = columns
        self.missing_threshold = missing_threshold
        self.categorical_unique_threshold = categorical_unique_threshold
        self.outlier_threshold = outlier_threshold

    # Step-0: Remove datetime columns
    def drop_date_time_columns(self):
        date_time_columns = [col["name"] for col in self.columns if col.get("type") == 'datetime']
        self.df = self.df.drop(columns=date_time_columns, errors="ignore")
        return self.df

    # Step-1: Drop columns with more than the specified threshold of missing values
    def drop_missing_values(self):
        missing_values = self.df.isnull().mean()
        to_drop = missing_values[missing_values > self.missing_threshold].index
        self.df = self.df.drop(columns=to_drop, errors="ignore")
        return self.df
    
    # Step-2: Drop columns with only one unique value
    def drop_unique_values(self):
        unique_values = self.df.nunique()
        to_drop = unique_values[unique_values == 1].index
        self.df = self.df.drop(columns=to_drop, errors="ignore")
        return self.df
    
    # Step-3: Drop categorical columns with more than the specified unique threshold
    def drop_categorical_values(self):
        categorical_columns = [col for col in self.columns if col.get("type") == "string"]
        for col in categorical_columns:
            if len(col.get("options", [])) > self.categorical_unique_threshold:
                self.df = self.df.drop(columns=[col["name"]], errors="ignore")
        return self.df
    
    # Step-4: Fill missing values with the mean for numeric columns
    def fill_missing_values(self):
        numeric_cols = self.df.select_dtypes(include=['number']).columns
        self.df[numeric_cols] = self.df[numeric_cols].fillna(self.df[numeric_cols].mean())
        return self.df
    
    # Execute all processing steps
    def process_data(self):
        self.drop_date_time_columns()
        self.drop_missing_values()
        self.drop_unique_values()
        self.drop_categorical_values()
        self.fill_missing_values()
        return self.df
