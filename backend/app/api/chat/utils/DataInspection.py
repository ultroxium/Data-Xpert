from io import StringIO
import random
import matplotlib.pyplot as plt
import base64
from io import BytesIO

import pandas as pd


class DataInspection:
    def __init__(self, df):
        self.df = df

    def head(self, n=5):
        html_head = self.df.head(n).to_html()
        return f"{html_head}"

    def tail(self, n=5):
        html_tail = self.df.tail(n).to_html()
        return f"{html_tail}"

    def info(self):
        info_data = []
        for column in self.df.columns:
            col_data = self.df[column]
            non_null_count = col_data.notnull().sum()
            null_count = col_data.isnull().sum()
            data_type = col_data.dtype
            
            # Initialize the info dictionary for the column
            column_info = {
                "Column Name": column,
                "Non-Null Count": non_null_count,
                "Null Count": null_count,
                "Data Type": str(data_type),
                "Total Unique Values": col_data.nunique()
            }
            
            # Additional info for numerical columns
            if pd.api.types.is_numeric_dtype(col_data):
                column_info["Max Value"] = col_data.max()
                column_info["Min Value"] = col_data.min()
                column_info["Most Frequent Value"] = None  # Not applicable for numerical data
            
            # Additional info for categorical or object columns
            elif pd.api.types.is_object_dtype(col_data) or pd.api.types.is_categorical_dtype(col_data):
                column_info["Max Value"] = None  # Not applicable for categorical data
                column_info["Min Value"] = None  # Not applicable for categorical data
                column_info["Most Frequent Value"] = col_data.mode().iloc[0] if not col_data.mode().empty else None
            
            # Append the column info to the list
            info_data.append(column_info)

        result = list_to_html_table(info_data)
        return result

    def describe(self):
        return f"{self.df.describe().to_html(classes='dataframe')}"

    def shape(self):
        shape = f"""
            <table>
            <tbody>
                <tr>
                    <td>Rows</td>
                    <td>{self.df.shape[0]}</td>
                </tr>
                <tr>
                    <td>Columns</td>
                    <td>{self.df.shape[1]}</td>
                </tr>
            </tbody>
            </table>
            """

        return shape

    def columns(self):
        columns = self.df.columns
        column_list = []
        for i in columns:
            column_list.append(i)
        return list_to_html_row(column_list)


    def memory_usage(self):
        data=self.df.memory_usage().to_frame(name='Memory Usage')
        return data.to_html()

    def missing_values(self):
        missing = self.df.isnull().sum().to_frame(name='Total Missing').to_html(classes='dataframe')
        return missing
    
    def unique_values(self):
        unique = {col: self.df[col].nunique() for col in self.df.columns}
        # Create HTML table structure
        table_html = """
        <table border="1" cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th>Column Name</th>
                    <th>Total Unique Values</th>
                </tr>
            </thead>
            <tbody>
        """
        # Add each column and its unique value count as a row
        for col, count in unique.items():
            table_html += f"""
                <tr>
                    <td>{col}</td>
                    <td>{count}</td>
                </tr>
            """
        # Close the table tag
        table_html += """
            </tbody>
        </table>
        """
        return table_html

    def data_types(self):
        return self.df.dtypes.to_frame(name='Data Types').to_html()

    def average_value(self):
        #check num col only
        num_cols = self.df.select_dtypes(include='number')
        if num_cols.empty:
            return "<pre>No numerical columns available for average value.</pre>"
        
        avg_values = num_cols.mean().to_frame(name='Average Value')
        return avg_values.to_html()
    
    def min_values(self):
        num_cols = self.df.select_dtypes(include='number')
        if num_cols.empty:
            return "<pre>No numerical columns available for minimum value.</pre>"
        
        min_values = num_cols.min().to_frame(name='Minimum Value')
        return min_values.to_html()
    
    def max_values(self):
        num_cols = self.df.select_dtypes(include='number')
        if num_cols.empty:
            return "<pre>No numerical columns available for maximum value.</pre>"
        
        max_values = num_cols.max().to_frame(name='Maximum Value')
        return max_values.to_html()
    
    def most_frequent_values(self):
        cat_cols = self.df.select_dtypes(include='object')
        if cat_cols.empty:
            return "<pre>No categorical columns available for most frequent value.</pre>"
        
        most_frequent_values = {}
        for col in cat_cols:
            most_frequent_values[col] = self.df[col].mode().iloc[0]
        
        # Create HTML table structure
        table_html = """
        <table border="1" cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th>Column Name</th>
                    <th>Most Frequent Value</th>
                </tr>
            </thead>
            <tbody>
        """
        # Add each column and its most frequent value as a row
        for col, value in most_frequent_values.items():
            table_html += f"""
                <tr>
                    <td>{col}</td>
                    <td>{value}</td>
                </tr>
            """
        # Close the table tag
        table_html += """
            </tbody>
        </table>
        """
        return table_html

        
    
    def get_value_counts(self):
        # Start the HTML structure
        html_output = "</br><div>"
        
        # Iterate over each column in the DataFrame
        for col in self.df.columns:
            unique_count = self.df[col].nunique()  # Get the number of unique values
            if unique_count == len(self.df):
                # All values are unique, show a message in a <p> tag
                html_output += f"""
                <p><strong>{col}</strong>: All values are unique</p> </br>
                """
            elif unique_count > 20:
                # Too many unique values, show a message in a <p> tag
                html_output += f"""
                <p><strong>{col}</strong>: Too many unique values to display</p> </br>
                """
            else:
                # Create a table of value counts for the column
                counts = self.df[col].value_counts()
                html_output += f"""
                <strong>{col}:</strong>
                {counts.to_frame(name='Counts').to_html(classes='value-counts', border=1)}
                </br>
                """
        
        # Close the HTML structure
        html_output += "</div>"
        
        return html_output



        

    def correlation(self):
        # Select only numeric columns
        numeric_df = self.df.select_dtypes(include=['number'])
        if numeric_df.empty:
            return "<pre>No numeric columns available for correlation.</pre>"
        
        correlation_matrix = numeric_df.corr().to_html(classes='dataframe')
        return f"{correlation_matrix}"


    def data_distribution(self):
        images_html = ""
        
        # Handle numerical columns
        for column in self.df.select_dtypes(include='number'):
            # Create a figure and plot the histogram
            fig, ax = plt.subplots()
            self.df[column].plot.hist(ax=ax, title=column)
            
            # Save the plot to a BytesIO object
            buf = BytesIO()
            fig.savefig(buf, format='png')
            plt.close(fig)  # Close the figure to avoid display issues
            
            # Get the Base64 string
            buf.seek(0)
            base64_image = base64.b64encode(buf.read()).decode('utf-8')
            buf.close()
            
            # Create the img tag with the Base64 string
            img_tag = f'<img src="data:image/png;base64,{base64_image}" alt="{column} histogram" />'
            images_html += img_tag + "<br/>"  # Add line break between images
        
        # Handle categorical columns
        for column in self.df.select_dtypes(include='object'):
            if self.df[column].nunique() <= 100:  # Only plot if there are 100 or fewer unique values
                # Create a figure and plot the bar chart
                fig, ax = plt.subplots()
                self.df[column].value_counts().plot(kind='bar', ax=ax, title=column)
                
                # Save the plot to a BytesIO object
                buf = BytesIO()
                fig.savefig(buf, format='png')
                plt.close(fig)  # Close the figure to avoid display issues
                
                # Get the Base64 string
                buf.seek(0)
                base64_image = base64.b64encode(buf.read()).decode('utf-8')
                buf.close()
                
                # Create the img tag with the Base64 string
                img_tag = f'<img src="data:image/png;base64,{base64_image}" alt="{column} bar chart" />'
                images_html += img_tag + "<br/>"  # Add line break between images
        
        return images_html
    
    def charts(self, type="scatter"):
        images_html = ""
        if type == "scatter":
            num_cols = self.df.select_dtypes(include='number').columns.tolist()
            if len(num_cols) > 1:
                for i in range(len(num_cols) - 1):
                    for j in range(i + 1, len(num_cols)):
                        fig, ax = plt.subplots()
                        self.df.plot.scatter(x=num_cols[i], y=num_cols[j], ax=ax, title=f'{num_cols[i]} vs {num_cols[j]} Scatter Plot')

                        buf = BytesIO()
                        fig.savefig(buf, format='png')
                        plt.close(fig)
                        buf.seek(0)
                        base64_image = base64.b64encode(buf.read()).decode('utf-8')
                        buf.close()

                        img_tag = f'<img src="data:image/png;base64,{base64_image}" alt="{num_cols[i]} vs {num_cols[j]} scatter plot" />'
                        images_html += img_tag + "<br/>"
            else:
                images_html = "<pre>Scatter plot requires at least 2 numerical columns.</pre>"

        elif type == "bar":
            cat_cols = self.df.select_dtypes(include='object').columns
            if len(cat_cols) > 0:
                for col in cat_cols:
                    fig, ax = plt.subplots()
                    self.df[col].value_counts().plot(kind='bar', ax=ax, title=f'{col} Bar Chart')
                    
                    buf = BytesIO()
                    fig.savefig(buf, format='png')
                    plt.close(fig)
                    buf.seek(0)
                    base64_image = base64.b64encode(buf.read()).decode('utf-8')
                    buf.close()
                    
                    img_tag = f'<img src="data:image/png;base64,{base64_image}" alt="{col} bar chart" />'
                    images_html += img_tag + "<br/>"
            else:
                images_html = "<pre>Bar chart requires at least 1 categorical column.</pre>"
            
        elif type=="box":
            num_cols = self.df.select_dtypes(include='number').columns
            if len(num_cols) > 0:
                for col in num_cols:
                    fig, ax = plt.subplots()
                    self.df[col].plot(kind='box', ax=ax, title=f'{col} Box Plot')
                    
                    buf = BytesIO()
                    fig.savefig(buf, format='png')
                    plt.close(fig)
                    buf.seek(0)
                    base64_image = base64.b64encode(buf.read()).decode('utf-8')
                    buf.close()
                    
                    img_tag = f'<img src="data:image/png;base64,{base64_image}" alt="{col} box plot" />'
                    images_html += img_tag + "<br/>"
            else:
                images_html = "<pre>Box plot requires at least 1 numerical column.</pre>"

        elif type =="pie":
            cat_cols = self.df.select_dtypes(include='object').columns
            if len(cat_cols) > 0:
                for col in cat_cols:
                    fig, ax = plt.subplots()
                    self.df[col].value_counts().plot(kind='pie', ax=ax, title=f'{col} Pie Chart')
                    
                    buf = BytesIO()
                    fig.savefig(buf, format='png')
                    plt.close(fig)
                    buf.seek(0)
                    base64_image = base64.b64encode(buf.read()).decode('utf-8')
                    buf.close()
                    
                    img_tag = f'<img src="data:image/png;base64,{base64_image}" alt="{col} pie chart" />'
                    images_html += img_tag + "<br/>"
            else:
                images_html = "<pre>Pie chart requires at least 1 categorical column.</pre>"
        return images_html

    def sample(self, n=5):
        return self.df.sample(n).to_html()

    def value_counts(self):
        counts_dict = {}
        for column in self.df.columns:
            counts_dict[column] = self.df[column].value_counts().to_frame(name='Counts')
            counts_dict[column].index.name = column  # Set the index name to the column name
        return {col: counts.to_html() for col, counts in counts_dict.items()}

    def others(self):
        greetings = [
            "Hello! How can I help you today?",
            "Hi there! What can I do for you?",
            "Greetings! How can I assist you today?"
        ]
        return random.choice(greetings)

def list_to_html_table(info_data):
    # Start the HTML table
    html = '<table border="1" cellpadding="5" cellspacing="0">'
    
    # Add table headers
    headers = info_data[0].keys()  # Get headers from the first dictionary
    html += '<tr>' + ''.join(f'<th>{header}</th>' for header in headers) + '</tr>'
    
    # Add table rows
    for row in info_data:
        html += '<tr>' + ''.join(f'<td>{value if value is not None else ""}</td>' for value in row.values()) + '</tr>'
    
    # End the HTML table
    html += '</table>'
    
    return html

def list_to_html_row(data_list):
    # Start the HTML table
    html = '<table border="1" cellpadding="5" cellspacing="0">'
    
    # Add table row (single row with headers)
    html += '<tr>' + ''.join(f'<th>{item}</th>' for item in data_list) + '</tr>'
    
    # End the HTML table
    html += '</table>'
    
    return html
