import builtins
from fastapi import status, HTTPException
from fastapi.responses import JSONResponse
from matplotlib import pyplot as plt
# from app.api.notifications.model import NotificationModel
from app.Helper.check_subscription import SubscriptionCheck
from app.Helper.dataset_explore import DataExplorer
from app.api.chat.model import ChatModel, UserRateLimit
from app.api.chat.utils.DataInspection import DataInspection
from app.api.notifications.model import NotificationModel
from app.api.workspaces.model import WorkspaceModel
from app.database.database import get_db
from app.api.charts.response import ChartCreate, ChartResponse,ChartUpdate
from sqlalchemy.orm import Session
from app.api.datasets.model import DatasetModel
from app.api.workspaces.teams.members_model import TeamMemberModel
from app.Helper.websocket import manager
import random
import string
import pandas as pd
import numpy as np
import sys
import json
from typing import Any, Dict
from app.Helper.check_permissions import PermissionCheck
from app.Helper.B2fileManager import B2FileManager
from app.core.config import settings

import google.generativeai as genai
import io
import contextlib

plt.switch_backend("Agg")

# Configure the generative AI model
genai.configure(api_key=settings.GENAI_API_KEY)
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

# Initialize the chat session
chat_session = model.start_chat(history=[])

class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user
        self.permission_check = PermissionCheck(db, current_user)
        self.b2_filemanager = B2FileManager()
        self.subscription = SubscriptionCheck(db, current_user)
        
    def _query_non_deleted_chat(self, **filters):
        return (
            self.db.query(NotificationModel)
            .filter_by(**filters, is_deleted=False)
            .first()
        )
    
    def save_chat_message(self,workspace_id,dataset_id, message_content: str, speaker: str) -> ChatModel:
        message = ChatModel(
            user_id=self.current_user.id,
            workspace_id=workspace_id,
            dataset_id=dataset_id,
            message=message_content,
            speaker=speaker
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message
    
    def all_chats(self, workspace_id, dataset_id):
        return (self.db.query(ChatModel)
                .filter(ChatModel.workspace_id == workspace_id, ChatModel.dataset_id == dataset_id, ChatModel.user_id==self.current_user.id)
                .order_by(ChatModel.created_at.asc())
                .all())
    

    def check_user_rate_limit(self):
        user_rate_limit = self.db.query(UserRateLimit).filter_by(user_id=self.current_user.id).first()
        if not user_rate_limit:
            new_user_rate_limit = UserRateLimit(user_id=self.current_user.id)
            self.db.add(new_user_rate_limit)
            self.db.commit()
            return True
        
        if user_rate_limit.is_limit_reached:
            return False
        
        user_rate_limit.request_count += 1
        self.db.commit()
        return True
    

    def send_message(self, workspace_id, dataset_id, message, speaker):
        dataset = self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
        is_rate_limit = self.check_user_rate_limit()
        if not is_rate_limit:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

        if dataset is None:
            raise HTTPException(status_code=404, detail="Dataset not found, can you try again?")
        
        self.save_chat_message(workspace_id, dataset_id, message, speaker)

        data_explorer = DataExplorer(dataset.data)
        df = data_explorer.get_df()
        columns = data_explorer.find_data_types()
        unique_data = [
            {'name': item['name'], 'type': item['type']}
            for item in columns
            if (item['name'], item['type']) not in {(d['name'], d['type']) for d in columns[:columns.index(item)]}
        ]

        # Remove duplicates while preserving order
        unique_data = [dict(t) for t in {tuple(d.items()) for d in unique_data}]


        if not message:
            result = "I'm not sure how to respond to that. Can you try asking differently?"
        
        help_phrases = ["help", "what can you do", "assist", "how to use", "support"]
        greetings_phrases = ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening"]
        bot_phrases = ["who made you", "what are you", "who created you", "about you"]
        error_res = [
                    "I'm not sure how to respond to that. Can you try asking differently?",
                    "I'm having trouble understanding your request. Can you rephrase it?",
                    "I'm not sure how to answer that. Can you provide more context?",
                    "I'm not sure how to help with that. Can you try asking a different question?",
                    "I'm not sure what you're asking. Can you provide more details?",
                ]

        

        if any(phrase in message.lower() for phrase in help_phrases):
            result = """
                You can ask me questions about the dataset or request specific data analysis tasks.
                Here are some examples of what you can ask:
                - 'Show me the first 5 rows of the data.'
                - 'What are the unique values in the column "category"?'
                - 'Generate a scatter plot for the columns "x" and "y".'
                - 'Calculate the average value of the column "price".'
                - 'Show me the data distribution of the column "age".'
                - 'What are the most frequent values in the column "city"?'
                - 'Provide a summary of the dataset.'
                - 'How many missing values are there in the dataset?'
                - 'What is the correlation between the columns "A" and "B"?'
                - 'Show me the last 5 rows of the data.'
            """
        elif any(phrase in message.lower() for phrase in greetings_phrases):
            result = "Hello! How can I help you with data analysis today?"

        elif any(phrase in message.lower() for phrase in bot_phrases):
            result = "I am trained by Predictify to help you explore data. How can I assist you today?"

        else:
            code_block_prompt = f"""
                User provided data columns: {unique_data}.
                User prompt: '{message}'.
                A DataFrame 'df' already exists, so you can use it to perform the task.
                
                If the user asks about your purpose or capabilities, respond with:
                "I am trained by Predictify to help you explore data. How can i assist you today?"
                
                If the user prompt refers to columns that exist in the data, return a valid Python code block to execute the task.
                Ensure that the final result (such as calculated values or outputs) is assigned to a variable named 'result' so that it can be captured.
                
                If the user prompt mentions columns that are not present in the data (such as 'wind'), return a helpful suggestion 
                to the user explaining that those columns are missing.

                If the user asks to generate a chart, only use matplotlib to create the chart. Convert the image to base64 format and 
                assign the base64-encoded string to the variable 'result' so that it can be returned.
                
                Example for generating a chart and returning it as base64:

                from io import BytesIO
                import matplotlib.pyplot as plt
                plt.switch_backend("Agg")
                import base64
                
                fig, ax = plt.subplots()
                df.plot(kind='bar', x='Date', y='rain', ax=ax)  # Adjust chart type based on user request
                buf = BytesIO()
                fig.savefig(buf, format='png')
                plt.close(fig)
                buf.seek(0)
                base64_image = base64.b64encode(buf.read()).decode('utf-8')
                buf.close()
                result = <img src="data:image/png;base64,base64_image />

                Return the Python code or the suggestion in a clear and complete manner.
            """
            response = chat_session.send_message(code_block_prompt)
            generated_code_block_or_suggestion = response.text

            try:
                # Clean the code block (removing Python delimiters like ```python or ``` if present)
                cleaned_code_block_or_suggestion = generated_code_block_or_suggestion.replace("```python", "").replace("```", "").strip()

                # Check if the model's response is code or a suggestion
                if "suggestion" in cleaned_code_block_or_suggestion.lower():
                    result = cleaned_code_block_or_suggestion
                else:
                    # If it's valid code, execute it
                    exec_globals = {}
                    exec_locals = {'df': df}

                    # Execute the code block (use exec for multiline code execution)
                    exec(cleaned_code_block_or_suggestion, exec_globals, exec_locals)

                    # Step 5: Capture the result if the code executed properly
                    if 'result' in exec_locals:
                        result = exec_locals['result']
                        
                    else:
                        result = random.choice(error_res)
            except Exception as e:
                result = random.choice(error_res)

            if isinstance(result, pd.DataFrame):
                result = result.to_html()
            else:
                result= f"<pre>{result}</pre>"
        
        response = self.save_chat_message(workspace_id, dataset_id, f"{result}", speaker="Predictify")
        return response


class ChatServices:
    def __init__(self, db: Session):
        self.db = db
        self.b2_filemanager = B2FileManager()

    def data_exploration(self, key: str, dataset_id: id, workspace_id: id):
        dataset = self.db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
        if dataset is None:
            return {"message": "Dataset not found, can you try again?"}
        
        if dataset:
            df = self.b2_filemanager.read_file(dataset.data, 'csv')
        
        data_inspector = DataInspection(df)
        
        inspection_methods = {
            'head': lambda: data_inspector.head(),
            'tail': lambda: data_inspector.tail(),
            'info': lambda: data_inspector.info(),
            'describe': lambda: data_inspector.describe(),
            'shape': lambda: data_inspector.shape(),
            'columns': lambda: data_inspector.columns(),
            'memory_usage': lambda: data_inspector.memory_usage(),
            'missing_values': lambda: data_inspector.missing_values(),
            'unique_values': lambda: data_inspector.unique_values(),
            'data_types': lambda: data_inspector.data_types(),
            'correlation': lambda: data_inspector.correlation(),
            'data_distribution': lambda: data_inspector.data_distribution(),
            'scatter_plot': lambda: data_inspector.charts(type='scatter'),
            'box_plot': lambda: data_inspector.charts(type='box'),
            'pie_plot': lambda: data_inspector.charts(type='pie'),
            'bar_plot': lambda: data_inspector.charts(type='bar'),
            'sample': lambda: data_inspector.sample(),
            'value_counts': lambda: data_inspector.get_value_counts(),
            'average_value': lambda: data_inspector.average_value(),
            'min_values': lambda: data_inspector.min_values(),
            'max_values': lambda: data_inspector.max_values(),
            'most_frequent_values': lambda: data_inspector.most_frequent_values(),
            'others': lambda: data_inspector.others(),
        }
        
        # Call the method corresponding to the key
        result = inspection_methods.get(key, lambda: "I'm not sure how to respond to that. Can you try asking differently?")()
        return result
    

keys = [
    'head', 'tail', 'info', 'describe', 'shape', 
    'columns', 'memory_usage', 
    'missing_values', 'unique_values', 'data_types',
    'average_value','min_values','max_values','most_frequent_values',
    'correlation', 'data_distribution','scatter_plot','box_plot','pie_plot','bar_plot', 'sample', 'value_counts', 'others_specific_query'
]