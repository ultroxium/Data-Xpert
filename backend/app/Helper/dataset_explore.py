import pandas as pd
import numpy as np
import re
from pandas.api.types import is_string_dtype, is_numeric_dtype, is_datetime64_any_dtype, is_bool_dtype, is_categorical_dtype

from app.Helper.B2fileManager import B2FileManager

# Regular expression for basic datetime pattern detection
class DataExplorer:
    def __init__(self, path):
        self.data_path = path
        self.b2_filemanager= B2FileManager()
        self.df = self.b2_filemanager.read_file(self.data_path, 'csv')

    def get_df(self):
        return self.df

    def get_file_name(self):
        return self.data_path.split('/')[-1]
    
    def get_file_size(self):
        size_in_bytes = self.b2_filemanager.get_file_size(self.data_path)

        # Convert bytes to KB or MB
        if size_in_bytes < 1024:
            size_str = f"{size_in_bytes:.2f} bytes"
        elif size_in_bytes < 1024 * 1024:
            size_str = f"{size_in_bytes / 1024:.2f} KB"
        else:
            size_str = f"{size_in_bytes / (1024 * 1024):.2f} MB"

        return size_str

    def find_data_types(self):
        # Improved datetime pattern to match different formats
        datetime_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}|^\d{2}/\d{2}/\d{4}')

        # Helper function to determine if a string series is likely a datetime based on pattern matching
        def is_probably_datetime(series):
            non_na_values = series.dropna()
            # If more than 80% of the non-NA values match the datetime pattern, consider it datetime
            if non_na_values.apply(lambda x: bool(datetime_pattern.match(str(x)))).mean() > 0.8:
                try:
                    # Try converting to datetime to confirm
                    pd.to_datetime(non_na_values, errors='raise')
                    return True
                except (ValueError, TypeError):
                    return False
            return False

        # Helper function to get detailed data type
        def get_detailed_dtype(series):
            if is_bool_dtype(series):
                return "boolean"
            elif is_numeric_dtype(series):
                return "number"
            elif isinstance(series.dtype, pd.CategoricalDtype):
                return "categorical"
            elif is_datetime64_any_dtype(series) or is_probably_datetime(series):
                return "datetime"
            elif is_string_dtype(series):
                return "string"
            else:
                return str(series.dtype)

        detailed_types = {col: get_detailed_dtype(self.df[col]) for col in self.df.columns}
        columns = []
        for col, dtype in detailed_types.items():
            columns.append({
                "name": col,
                "type": dtype,
                "options": self.get_column_name_with_options(col) if dtype == 'string' else []
            })

        return columns
    
    
    def get_column_name_with_options(self, column_name):
        options = []

        # Check if the specified column exists in the DataFrame
        if column_name in self.df.columns:
            # Check if the column is categorical
                options = self.df[column_name].unique().tolist() # Return an empty list if the column is not categorical
        else:
            raise ValueError(f"Column '{column_name}' does not exist in the DataFrame.")

        return options
    
    def get_suggestions_for_classification_problem(self):
        suggestions = {
            "potential_targets": [],
            "columns_to_consider_removing": [],
            "target_recommendation": None
        }

        columns = self.find_data_types()
        
        # Count different types of columns
        type_counts = {
            "number": 0,
            "string": 0,
            "datetime": 0
        }
        
        # Analyze each column
        for column_info in columns:
            column_name = column_info["name"]
            col_type = column_info["type"]
            col_options = column_info["options"]
            
            # Update type counts
            if col_type in type_counts:
                type_counts[col_type] += 1
            
            # Remove datetime columns
            if col_type == "datetime":
                suggestions["columns_to_consider_removing"].append({
                    "column": column_name,
                    "reason": "Datetime columns are not suitable for direct classification",
                    "suggestion": "Consider feature engineering if temporal patterns are important"
                })
                continue
            
            # Analyze string columns
            if col_type == "string":
                if len(col_options) > 0:  # Categorical column with predefined options
                    if 2 <= len(col_options) <= 10:  # Good candidate for target
                        suggestions["potential_targets"].append({
                            "column": column_name,
                            "n_classes": len(col_options),
                            "classes": col_options,
                            "suitability": "High" if len(col_options) <= 5 else "Medium"
                        })
                        
                        # If binary classification found, mark as potentially better target
                        if len(col_options) == 2:
                            suggestions["target_recommendation"] = {
                                "column": column_name,
                                "reason": "Binary classification with two distinct classes",
                                "classes": col_options
                            }
                    elif len(col_options) > 10:
                        suggestions["columns_to_consider_removing"].append({
                            "column": column_name,
                            "reason": "High cardinality categorical variable (too many classes)",
                            "suggestion": "Consider grouping categories or encoding if important"
                        })
                else:  # String column without predefined options
                    suggestions["columns_to_consider_removing"].append({
                        "column": column_name,
                        "reason": "Free-text string column or identifier",
                        "suggestion": "Consider text feature extraction if contains valuable information"
                    })
            
            # Analyze numeric columns for potential targets
            elif col_type == "number":
                unique_values = len(self.df[column_name].unique())
                if 2 <= unique_values <= 10:
                    suggestions["potential_targets"].append({
                        "column": column_name,
                        "n_classes": unique_values,
                        "classes": sorted(self.df[column_name].unique().tolist()),
                        "suitability": "Medium",
                        "note": "Numeric column with few unique values"
                    })
                    
                    # If binary numeric classification found
                    if unique_values == 2:
                        if not suggestions["target_recommendation"]:  # Only if no string binary target found
                            suggestions["target_recommendation"] = {
                                "column": column_name,
                                "reason": "Binary numeric classification with two distinct values",
                                "classes": sorted(self.df[column_name].unique().tolist())
                            }
        
        # Overall dataset recommendations
        final_recommendations = {
            "general_recommendations": []
        }

        # Add target recommendations
        if suggestions['potential_targets']:
            target_columns = [item["column"] for item in suggestions['potential_targets']]
            target_classes = [item['classes'] for item in suggestions['potential_targets']]
            final_recommendations["general_recommendations"].append(
                f"Found {len(suggestions['potential_targets'])} potential target columns for classification: {target_columns} "
                f"with corresponding classes: {target_classes}"
            )
        
        # Add primary target recommendation if exists
        if suggestions["target_recommendation"]:
            final_recommendations["general_recommendations"].append(
                f"Recommended target: '{suggestions['target_recommendation']['column']}' because of "
                f"{suggestions['target_recommendation']['reason']}"
            )
        
        # Add removal recommendations
        if suggestions['columns_to_consider_removing']:
            remove_columns = [item['column'] for item in suggestions['columns_to_consider_removing']]
            remove_reasons = [item['reason'] for item in suggestions['columns_to_consider_removing']]
            final_recommendations["general_recommendations"].append(
                f"Consider removing {len(remove_columns)} columns: {remove_columns} "
                f"due to: {remove_reasons}"
            )
        
        if not suggestions["potential_targets"]:
            final_recommendations["general_recommendations"].append(
                "No clear classification target found. Review columns or consider creating derived target variables"
            )
        recommendations_html = ""

        # Add target recommendations
        if suggestions['potential_targets']:
            recommendations_html += "<h4 style='font-weight:bolder;'>Potential target columns found:</h4><ul>"
            for item in suggestions['potential_targets']:
                recommendations_html += f"<li style='color:#aaa;'>{item['column']}: {', '.join(str(c) for c in item['classes'])}</li>"
            recommendations_html += "</ul>"

        # Add primary target recommendation if exists
        if suggestions["target_recommendation"]:
            recommendations_html += "<h4 style='font-weight:bolder;'>Recommended target:</h4>"
            recommendations_html += f"<p>  - {suggestions['target_recommendation']['column']} ({suggestions['target_recommendation']['reason']})</p>"

        # Add removal recommendations
        if suggestions['columns_to_consider_removing']:
            recommendations_html += "<h4 style='font-weight:bolder;'>Columns to consider removing:</h4><ul>"
            for item in suggestions['columns_to_consider_removing']:
                recommendations_html += f"<li style='color:#aaa;'>{item['column']}: {item['reason']}</li>"
            recommendations_html += "</ul>"

        if not suggestions["potential_targets"]:
            recommendations_html += "<h4 style='font-weight:bolder;'>No clear classification target found. Review columns or consider creating derived target variables.</h4>"

        return recommendations_html.strip()

    
    def get_suggestions_for_regression_problem(self):
        suggestions = {
            "potential_targets": [],
            "columns_to_consider_removing": [],
            "target_recommendation": None
        }

        columns = self.find_data_types()
        
        # Count different types of columns
        type_counts = {
            "number": 0,
            "string": 0,
            "datetime": 0
        }
        
        # Analyze each column
        for column_info in columns:
            column_name = column_info["name"]
            col_type = column_info["type"]
            col_options = column_info["options"]
            
            # Update type counts
            if col_type in type_counts:
                type_counts[col_type] += 1
            
            # Remove datetime columns
            if col_type == "datetime":
                suggestions["columns_to_consider_removing"].append({
                    "column": column_name,
                    "reason": "Datetime columns are not suitable for direct regression",
                    "suggestion": "Consider feature engineering if temporal patterns are important"
                })
                continue
            
            # Remove string columns or convert to numeric features
            if col_type == "string":
                if len(col_options) > 0:  # Categorical column with predefined options
                    if len(col_options) <= 10:
                        suggestions["columns_to_consider_removing"].append({
                            "column": column_name,
                            "reason": "Categorical variable - needs encoding",
                            "suggestion": "Consider one-hot encoding or label encoding for use as feature"
                        })
                    else:
                        suggestions["columns_to_consider_removing"].append({
                            "column": column_name,
                            "reason": "High cardinality categorical variable",
                            "suggestion": "Consider removing or using advanced encoding techniques"
                        })
                else:
                    suggestions["columns_to_consider_removing"].append({
                        "column": column_name,
                        "reason": "Free-text string column or identifier",
                        "suggestion": "Not suitable for regression"
                    })
            
            # Analyze numeric columns for potential targets
            elif col_type == "number":
                unique_values = len(self.df[column_name].unique())
                # For regression, we want continuous variables with many unique values
                if unique_values > 10:
                    suggestions["potential_targets"].append({
                        "column": column_name,
                        "unique_values": unique_values,
                        "suitability": "High" if unique_values > 100 else "Medium",
                        "note": "Continuous numeric variable suitable for regression"
                    })
                    
                    # Recommend columns that likely represent continuous measurements
                    if any(keyword in column_name.lower() for keyword in 
                        ["weight", "height", "temperature", "pressure", "rate", "amount", "value", "price"]):
                        suggestions["target_recommendation"] = {
                            "column": column_name,
                            "reason": f"Continuous numeric variable with {unique_values} unique values",
                            "note": "Name suggests a measurable quantity"
                        }
                else:
                    suggestions["columns_to_consider_removing"].append({
                        "column": column_name,
                        "reason": "Discrete numeric variable with few unique values",
                        "suggestion": "More suitable for classification or as categorical feature"
                    })
        
        # Create bullet-point recommendations
        recommendations_html = ""

        # Add target recommendations
        if suggestions['potential_targets']:
            recommendations_html += "<h4 style='font-weight:bolder;'>Potential target columns for regression:</h4><ul>"
            for item in suggestions['potential_targets']:
                recommendations_html += f"<li style='color:#aaa;'>{item['column']}: {item['unique_values']} unique values "
                recommendations_html += f"({item['suitability']} suitability)</li>"
            recommendations_html += "</ul>"

        # Add primary target recommendation if exists
        if suggestions["target_recommendation"]:
            recommendations_html += "<h4 style='font-weight:bolder;'>Recommended target:</h4>"
            recommendations_html += f"<p>  - {suggestions['target_recommendation']['column']} "
            recommendations_html += f"({suggestions['target_recommendation']['reason']})</p>"

        # Add removal/transformation recommendations
        if suggestions['columns_to_consider_removing']:
            recommendations_html += "<h4 style='font-weight:bolder;'>Columns to handle:</h4><ul>"
            for item in suggestions['columns_to_consider_removing']:
                recommendations_html += f"<li style='color:#aaa;'>{item['column']}: {item['reason']}</li>"
                if 'suggestion' in item:
                    recommendations_html += f"<li style='color:#aaa;'>  Suggestion: {item['suggestion']}</li>"
            recommendations_html += "</ul>"

        # Add note if no suitable targets found
        if not suggestions["potential_targets"]:
            recommendations_html += "<h4>No clear regression target found. Look for continuous numeric variables or consider transforming existing columns.</h4>"

        return recommendations_html.strip()
