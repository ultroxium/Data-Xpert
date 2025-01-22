import json
from typing import Dict, List
from fastapi import Depends, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy.orm import Session

class ConnectionManager:
    def __init__(self):
        self.active_chat_connections: Dict[int, List[WebSocket]] = {}
        self.active_notification_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int, connection_type: str):
        await websocket.accept()
        if connection_type == 'chat':
            if user_id not in self.active_chat_connections:
                self.active_chat_connections[user_id] = []
            self.active_chat_connections[user_id].append(websocket)
            print(f"Chat connected: {user_id}")
        elif connection_type == 'notification':
            if user_id not in self.active_notification_connections:
                self.active_notification_connections[user_id] = []
            self.active_notification_connections[user_id].append(websocket)
            print(f"Notification connected: {user_id}")

        print(f"Active connections: {self.active_chat_connections}, {self.active_notification_connections}")

    def disconnect(self, user_id: int, connection_type: str):
        if connection_type == 'chat' and user_id in self.active_chat_connections:
            self.active_chat_connections[user_id] = [
                ws for ws in self.active_chat_connections[user_id] if not ws.client
            ]
            if not self.active_chat_connections[user_id]:
                del self.active_chat_connections[user_id]
            print(f"Chat disconnected: {user_id}")
        elif connection_type == 'notification' and user_id in self.active_notification_connections:
            self.active_notification_connections[user_id] = [
                ws for ws in self.active_notification_connections[user_id] if not ws.client
            ]
            if not self.active_notification_connections[user_id]:
                del self.active_notification_connections[user_id]
            print(f"Notification disconnected: {user_id}")
        else:
            print(f"Attempted to disconnect unknown user_id: {user_id}")
        print(f"Active connections after disconnect: {self.active_chat_connections}, {self.active_notification_connections}")

    async def send_personal_message(self, message: Dict, user_id: int, connection_type: str):
        if connection_type == 'chat':
            websockets = self.active_chat_connections.get(user_id, [])
        elif connection_type == 'notification':
            websockets = self.active_notification_connections.get(user_id, [])
        else:
            return  # Unknown connection type

        for websocket in websockets:
            try:
                message_str = json.dumps(message)
                await websocket.send_text(message_str)
            except Exception as e:
                print(f"Error sending message: {e}")
                self.disconnect(user_id, connection_type)  # Disconnect on error


manager = ConnectionManager()