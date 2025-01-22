from fastapi import HTTPException,status
import pandas as pd
import requests
import json
from typing import Dict, List, Any, Union
from collections import defaultdict

class URLToDataFrame:
    """A class to fetch JSON data from a URL and convert it to a pandas DataFrame with nested structure support."""
    
    def __init__(self, url: str,headers: Dict[str, str] = None):
        """Initialize with URL to fetch data from.
        
        Args:
            url (str): The URL to fetch JSON data from
        """
        self.url = url
        self.headers = headers
        self.data = None
        self.columns = None
        self.nested_structure = None
        
    # def fetch_data(self) -> None:
    #     """Fetch data from the URL and store it."""
    #     try:
    #         #add headrs as well which is like {"Authorization": "Bearer token"}
    #         #if response failed handle that too
    #         if self.headers:
    #             response = requests.get(self.url,headers=self.headers)
    #         else:
    #             response = requests.get(self.url)
            
    #         if response.status_code != 200 or not response.json():
    #             raise HTTPException(
    #             status_code=status.HTTP_400_BAD_REQUEST,
    #             detail="Failed to fetch data from the URL.",
    #         )
            
    #         response.raise_for_status()
    #         self.data = response.json()
    #         # Handle cases where the actual data is nested under a key
    #         if isinstance(self.data, dict):
    #             # Try to find the main data array
    #             for key, value in self.data.items():
    #                 if isinstance(value, list):
    #                     self.data = value
    #                     break
    #     except requests.exceptions.RequestException as e:
    #         raise ConnectionError(f"Failed to fetch data from {self.url}: {str(e)}")

    def fetch_data(self) -> None:
        """Fetch data from the URL and store it with error handling."""
        try:
            response = requests.get(self.url, headers=self.headers) if self.headers else requests.get(self.url)

            # Check for unsuccessful status codes
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Request failed with status code {response.status_code}: {response.text}"
                )

            # Attempt to parse JSON
            try:
                self.data = response.json()
            except ValueError:  # Catch JSON decode errors
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid JSON response from the URL. Could not decode."
                )

            # If data is a dict, check if the main data is nested
            if isinstance(self.data, dict):
                for key, value in self.data.items():
                    if isinstance(value, list):
                        self.data = value
                        break
        except requests.RequestException as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch data from {self.url}: {str(e)}"
            )
            
    def get_all_columns(self, data: List[Dict]) -> List[Dict[str, Any]]:
        """Extract all column information from the data.
        
        Args:
            data (List[Dict]): The data to analyze
            
        Returns:
            List[Dict[str, Any]]: List of column information dictionaries
        """
        columns = []
        seen = set()
        
        def explore_item(item: Any, path: List[str] = None) -> None:
            if path is None:
                path = []
                
            if isinstance(item, dict):
                for key, value in item.items():
                    new_path = path + [key]
                    key_str = '.'.join(new_path)
                    
                    if key_str not in seen:
                        seen.add(key_str)
                        is_nested = isinstance(value, (dict, list))
                        columns.append({
                            'key': key,
                            'path': new_path,
                            'is_nested': is_nested
                        })
                        
                    if isinstance(value, (dict, list)):
                        explore_item(value, new_path)
                        
            elif isinstance(item, list) and item:
                explore_item(item[0], path)
                
        for item in data[:1]:  # Only need to explore first item for structure
            explore_item(item)
            
        return columns
        
    def _flatten_object(self, obj: Dict) -> Dict:
        """Flatten a nested dictionary.
        
        Args:
            obj (Dict): The dictionary to flatten
            
        Returns:
            Dict: Flattened dictionary
        """
        flattened = {}
        for key, value in obj.items():
            if isinstance(value, dict):
                flattened[key] = value  # Keep nested dicts as is
            elif isinstance(value, list):
                flattened[key] = value  # Keep lists as is
            else:
                flattened[key] = value
        return flattened
        
    def flatten_data(self, data: Any) -> List[Dict]:
        """Flatten nested JSON data into a list of flat dictionaries.
        
        Args:
            data (Any): The data to flatten
            
        Returns:
            List[Dict]: List of flattened dictionaries
        """
        if not data:
            return []
        if isinstance(data, list):
            return [
                item if not isinstance(item, dict)
                else self._flatten_object(item)
                for item in data
            ]
        if isinstance(data, dict):
            array_item = next(
                ((k, v) for k, v in data.items() if isinstance(v, list)),
                None
            )
            if array_item:
                return self.flatten_data(array_item[1])
            return [self._flatten_object(data)]
        return [data]
        
    def get_nested_structure(self) -> Dict[str, List[str]]:
        """Group columns by their parent structure.
        
        Returns:
            Dict[str, List[str]]: Dictionary mapping parent columns to their nested fields
        """
        nested_structure = defaultdict(list)
        
        for col in self.columns:
            if col['is_nested']:
                parent = col['path'][0]
                nested_structure[parent].append(col['key'])
                
        return dict(nested_structure)
        
    def process_nested_column(self, row: Dict, columns: List[str]) -> Dict:
        """Process nested columns into a structured dictionary.
        
        Args:
            row (Dict): The row data to process
            columns (List[str]): List of column names to process
            
        Returns:
            Dict: Processed nested data
        """
        nested_data = {col: row.get(col) for col in columns}
        return nested_data
        
    def to_dataframe(self, save_path: str = None, flatten: bool = False) -> pd.DataFrame:
        """Convert the fetched data to a pandas DataFrame.
        
        Args:
            save_path (str, optional): Path to save the DataFrame as CSV. Defaults to None.
            flatten (bool, optional): Whether to flatten nested columns. Defaults to False.
            
        Returns:
            pd.DataFrame: The processed DataFrame
        """
        if self.data is None:
            self.fetch_data()
            
        # Get all columns
        self.columns = self.get_all_columns(self.data)
        
        # Get nested structure
        self.nested_structure = self.get_nested_structure()
        
        # Get non-nested columns
        non_nested_columns = [col['key'] for col in self.columns if not col['is_nested']]
        
        # Flatten the data
        flattened_data = self.flatten_data(self.data)
        
        # Process each nested structure
        result_data = []
        for row in flattened_data:
            row_data = {col: row.get(col) for col in non_nested_columns}
            
            # Process each nested group
            for parent, nested_cols in self.nested_structure.items():
                row_data[parent] = self.process_nested_column(row, nested_cols)
                
            result_data.append(row_data)
        
        # Create DataFrame
        df = pd.DataFrame(result_data)
        
        if save_path:
            if flatten:
                df_flat = df.copy()
                for col in df.columns:
                    if isinstance(df[col].iloc[0], dict):
                        df_flat[col] = df[col].apply(json.dumps)
                df_flat.to_csv(save_path, index=False)
            else:
                df.to_csv(save_path, index=False)
        
        return df