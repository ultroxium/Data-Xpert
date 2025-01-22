from fastapi import HTTPException,status
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder
import category_encoders as ce
import joblib
from pandas.api.types import is_categorical_dtype,is_object_dtype
import ast

def get_column_categories(df,column_names):
            categories = {}
            for column_name in column_names:
                if is_categorical_dtype(df[column_name]):
                    categories[column_name] = df[column_name].cat.categories.tolist()
                elif is_object_dtype(df[column_name]):
                    categories[column_name] = df[column_name].unique().tolist()
                else:
                    raise ValueError(f"Column {column_name} cannot be ordinal encoded as it is not categorical or object type.")
            return categories

class DataEncoder:
    def __init__(self, df,encoder_path,b2_filemanager,is_save_encoder=True):
        self.df = df
        self.encoder_path = encoder_path
        self.b2_filemanager = b2_filemanager
        self.is_save_encoder = is_save_encoder

    def _save_encoder(self, encoder, encoder_name):
        path = f"{self.encoder_path}/{encoder_name}.pkl"
        self.b2_filemanager.write_file(encoder,path,'encoder')  

    # Label Encoding
    def label_encode(self, column_names):
        for column_name in column_names:
            le = LabelEncoder()  
            self.df[column_name] = le.fit_transform(self.df[column_name])
            if self.is_save_encoder:
                self._save_encoder(le, f"label_encoder_{column_name.replace(' ', '_').replace('/', '_').lower()}")
        return self.df

    # One-Hot Encoding
    def one_hot_encode(self, column_names):
        for column_name in column_names:
            ohe = OneHotEncoder(sparse_output=False, drop='first', handle_unknown="ignore")
            encoded_df = ohe.fit_transform(self.df[[column_name]])
            encoded_df = pd.DataFrame(encoded_df, columns=ohe.get_feature_names_out([column_name]))
            self.df = self.df.join(encoded_df).drop(column_name, axis=1)
            if self.is_save_encoder:
                self._save_encoder(ohe, f"one_hot_encoder_{column_name.replace(' ', '_').replace('/', '_').lower()}")
        return self.df

    # Ordinal Encoding
    def ordinal_encode(self, column_names, categories):
        for column_name in column_names:
            if column_name in categories:
                ordinal_encoder = OrdinalEncoder(categories=[categories[column_name]],handle_unknown="use_encoded_value",unknown_value=-1)
                self.df[column_name] = ordinal_encoder.fit_transform(self.df[[column_name]])
                if self.is_save_encoder:
                    self._save_encoder(ordinal_encoder, f"ordinal_encoder_{column_name.replace(' ', '_').replace('/', '_').lower()}")
            else:
                raise ValueError(f"Categories for column {column_name} not found.")
        return self.df


    # Binary Encoding
    def binary_encode(self, column_names):
        for column_name in column_names:
            encoder = ce.BinaryEncoder(handle_unknown="value",handle_missing="value")
            self.df = self.df.join(encoder.fit_transform(self.df[[column_name]])).drop(column_name, axis=1)
            if self.is_save_encoder:
                self._save_encoder(encoder, f"binary_encoder_{column_name.replace(' ', '_').replace('/', '_').lower()}")
        return self.df
    
    def get_df(self):
        return self.df
    
    def encode_data(self, meta_data,df):
        for col in df.columns:
            if meta_data.get(col) == 'label':
                encoder = self.b2_filemanager.read_file(f"{self.encoder_path}/label_encoder_{col.replace(' ', '_').replace('/', '_').lower()}.pkl", 'encoder')
                df[col] = encoder.transform(df[col])
            if meta_data.get(col) == 'one_hot':
                encoder = self.b2_filemanager.read_file(f"{self.encoder_path}/one_hot_encoder_{col.replace(' ', '_').replace('/', '_').lower()}.pkl", 'encoder')
                transformed = encoder.transform(df[[col]])
                one_hot_df = pd.DataFrame(transformed, columns=encoder.get_feature_names_out([col]))
                df = pd.concat([df, one_hot_df], axis=1).drop(columns=[col])
            if meta_data.get(col) == 'ordinal':
                encoder = self.b2_filemanager.read_file(f"{self.encoder_path}/ordinal_encoder_{col.replace(' ', '_').replace('/', '_').lower()}.pkl", 'encoder')
                df[col] = encoder.transform(df[[col]])
            if meta_data.get(col) == 'binary':
                encoder = self.b2_filemanager.read_file(f"{self.encoder_path}/binary_encoder_{col.replace(' ', '_').replace('/', '_').lower()}.pkl", 'encoder')
                transformed_data = encoder.transform(df[col])
                if transformed_data.shape[1] == 1:
                    df[col] = transformed_data
                else:
                    new_columns = [f"{col}_{i}" for i in range(transformed_data.shape[1])]
                    df[new_columns] = transformed_data
                    df.drop(columns=[col], inplace=True)
        return df



class DataDecoder:
    def __init__(self, df,encoder_path,b2_filemanager):
        self.df = df
        self.encoder_path = encoder_path
        self.b2_filemanager = b2_filemanager
        
    def _load_encoder(self, encoder_name):
        encoder_path = f"{self.encoder_path}/{encoder_name}.pkl"
        return self.b2_filemanager.read_file(encoder_path,'encoder')
    
    # Label Decoding
    def label_decode(self, column_names):
        for column_name in column_names:
            encoder_path = f"label_encoder_{column_name.replace(' ', '_').replace('/', '_').lower()}"
            le = self._load_encoder(encoder_path)
            self.df[column_name] = le.inverse_transform(self.df[column_name])
        return self.df

    # One-Hot Decoding
    def one_hot_decode(self, original_col_names):
        for original_col_name in original_col_names:
            encoder_path = f"one_hot_encoder_{original_col_name.replace(' ', '_').replace('/', '_').lower()}"
            ohe = self._load_encoder(encoder_path)
            one_hot_cols = ohe.get_feature_names_out([original_col_name])
            decoded_values = ohe.inverse_transform(self.df[one_hot_cols])

            if decoded_values.ndim == 2:
                decoded_values = decoded_values[:, 0]

            self.df[original_col_name] = decoded_values
            self.df.drop(one_hot_cols, axis=1, inplace=True)
        return self.df

    # Ordinal Decoding
    def ordinal_decode(self, column_names):
        for column_name in column_names:
            encoder_path = f"ordinal_encoder_{column_name.replace(' ', '_').replace('/', '_').lower()}"
            ordinal_encoder = self._load_encoder(encoder_path)
            decoded_values = ordinal_encoder.inverse_transform(self.df[[column_name]])
            decoded_values = decoded_values.ravel() if decoded_values.ndim == 2 else decoded_values
            self.df[column_name] = decoded_values
        return self.df

    # Binary Decoding
    def binary_decode(self, column_names):
        for column_name in column_names:
            encoder_path = f"binary_encoder_{column_name.replace(' ', '_').replace('/', '_').lower()}"
            encoder = self._load_encoder(encoder_path)
            binary_cols = self.df.filter(like=column_name).columns
            decoded_values = encoder.inverse_transform(self.df[binary_cols])

            if isinstance(decoded_values, pd.DataFrame):
                decoded_values = decoded_values.iloc[:, 0]

            self.df[column_name] = decoded_values
            self.df.drop(binary_cols, axis=1, inplace=True)
        return self.df