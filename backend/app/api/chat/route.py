from datetime import datetime
import json
import re
from typing import List
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status, Depends
from sqlalchemy.orm import Session
from app.Helper.websocket import manager
from app.api.chat.model import ChatModel
from app.database.database import get_db
from app.api.auth.services import get_current_active_user
from app.api.chat.services import Services
from app.api.chat.response import GetChats
from app.core.config import settings
from jose import jwt, JWTError
import google.generativeai as genai

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

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
    responses={404: {"description": "Not found"}},
)

def get_services(db: Session = Depends(get_db), current_user: dict = Depends(get_current_active_user)) -> Services:
    return Services(db=db, current_user=current_user)

@router.get("/", response_model=List[GetChats])
def get_all_chats(workspace_id: int, dataset_id: int, services: Services = Depends(get_services)):
    return services.all_chats(workspace_id, dataset_id)

@router.post("/send_message", response_model=GetChats)
def send_message(workspace_id: int, dataset_id: int, message: str,speaker:str, services: Services = Depends(get_services)):
    return services.send_message(workspace_id, dataset_id, message,speaker)

# @router.websocket("/ws/token={token}")
# async def websocket_chat(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
#     try:
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
#         user_id = payload.get("id")
#         if user_id is None:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
#     except JWTError:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

#     await manager.connect(websocket, user_id, 'chat')
#     chat_service = ChatServices(db)

#     try:
#         while True:
#             user_message = await websocket.receive_text()
#             user_data = parse_user_message(user_message)
#             message_content = user_data.get("message", "").strip()

#             received_message = save_chat_message(db, user_id, user_data, message_content, speaker=user_data['speaker'])
#             response_key = await get_response_key(message_content)

#             response_data = ""
#             if response_key in keys:
#                 response_data = chat_service.data_exploration(response_key, user_data['dataset_id'], user_data['workspace_id'])
#                 response_message = f"{response_data}"
#                 # response_message = await generate_response(response_data)
#             else:
#                 response_message = "I'm not sure how to respond to that. Can you try asking differently?"

#             send_message = save_chat_message(db, user_id, user_data, f"{response_message}", speaker="Predictify")
#             await manager.send_personal_message({
#                 'sender': "Predictify",
#                 # 'message': f"{response_message}\n {response_data}" if response_key not in ["others"] else response_data,
#                 'message': f"{response_message}",
#                 'created_at': datetime.now().isoformat()
#             }, user_id, 'chat')

#     except WebSocketDisconnect:
#         print(f"WebSocket disconnected for user_id: {user_id}")
#         manager.disconnect(user_id, 'chat')

# def parse_user_message(user_message: str) -> dict:
#     try:
#         return json.loads(user_message)
#     except json.JSONDecodeError:
#         return {}

# def save_chat_message(db: Session, user_id: str, user_data: dict, message_content: str, speaker: str) -> ChatModel:
#     message = ChatModel(
#         user_id=user_id,
#         workspace_id=user_data.get("workspace_id"),
#         dataset_id=user_data.get("dataset_id"),
#         message=message_content,
#         speaker=speaker
#     )
#     db.add(message)
#     db.commit()
#     db.refresh(message)
#     return message

# async def get_response_key(message_content: str) -> str:
#     response = chat_session.send_message(
#         f"Given the message content: '{message_content}' and the list of keys: {keys}, please identify the key that best fits the message content. Ensure that the response is a single word representing the key, for example: 'head'."
#     )
#     # return re.sub(r'[\*\.\n\s]+', '', response.text).strip()
#     return response.text.strip()
#     # return message_content

# async def generate_response(response_data: str) -> str:
#     res_message = chat_session.send_message(
#         f"Please provide an information in natural language format, using 1 or 2 sentences if necessary:\n{response_data}"
#     )
#     return res_message.text

