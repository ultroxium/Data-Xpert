from fastapi.routing import APIRouter
from typing import Dict, List
from fastapi import Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.Helper.websocket import manager
from app.api.auth.services import get_current_active_user
from app.api.notifications.response import GetNotification
from app.database.database import get_db
from app.api.notifications.services import Services
from jose import jwt, JWTError
from app.core.config import settings



router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
    responses={404: {"description": "Not found"}},
)

def get_services(
    db: Session = Depends(get_db), current_user: dict = Depends(get_current_active_user)
) -> Services:
    return Services(db=db, current_user=current_user)


@router.get("/",response_model=List[GetNotification])
def get_all_notifications(status:str="unread",
    query: str = Query(None, description="Search value in any field"),
    limit: int = Query(10, description="Limit number of rows to fetch"),
    offset: int = Query(0, description="Offset for pagination"),services: Services = Depends(get_services)
    ):
    notifications = services.all_notifications(status,query,limit,offset)
    return notifications

#mark as read
@router.put("/{notification_id}",response_model=GetNotification)
def mark_as_read(notification_id:int, services: Services = Depends(get_services)):
    notification = services.mark_as_read(notification_id)
    return {
        "message": "Notification marked as read",
        "notification": notification
    }

#mark all as read
@router.put("/all")
def mark_all_as_read(services: Services = Depends(get_services)):
    notification = services.mark_all_as_read()
    return {
        "message": "All notifications marked as read"
    }

#delete notification
@router.delete("/{notification_id}",response_model=GetNotification)
def delete_notification(notification_id:int, services: Services = Depends(get_services)):
    notification = services.delete_notification(notification_id)
    return {
        "message": "Notification deleted successfully.",
        "notification": notification
    }

@router.websocket("/ws/token={token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")

    await manager.connect(websocket, user_id,'notification')
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Data received: {data}")
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user_id: {user_id}")
        manager.disconnect(user_id,'notification')
