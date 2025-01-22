from fastapi import status, HTTPException
from app.api.notifications.model import NotificationModel
from sqlalchemy.orm import Session
from typing import Any, Dict

class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user

    def _query_non_deleted_notifications(self, **filters):
        return (
            self.db.query(NotificationModel)
            .filter_by(**filters, is_deleted=False)
        )
    
    def all_notifications(self, status: str, query: str, limit: int, offset: int):
        if query:
            notifications = (
                self._query_non_deleted_notifications(user_id=self.current_user.id)
                .filter(NotificationModel.message.contains(query))
                .limit(limit)
                .offset(offset)
                .all()
            )
        elif status == "all":
            notifications = (
                self._query_non_deleted_notifications(user_id=self.current_user.id)
                .limit(limit)
                .offset(offset)
                .all()
            )
        elif status == "unread":
            notifications = (
                self._query_non_deleted_notifications(user_id=self.current_user.id, is_read=False)
                .limit(limit)
                .offset(offset)
                .all()
            )
        elif status == "read":
            notifications = (
                self._query_non_deleted_notifications(user_id=self.current_user.id, is_read=True)
                .limit(limit)
                .offset(offset)
                .all()
            )

        return notifications
    
    def mark_as_read(self, notification_id: int):
        notification = (
            self._query_non_deleted_notifications(id=notification_id)
            .first()
        )
        if not notification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        
        notification.is_read = True
        self.db.commit()
        return notification
    
    def mark_all_as_read(self):
        notifications = (
            self._query_non_deleted_notifications(user_id=self.current_user.id, is_read=False)
            .all()
        )
        for notification in notifications:
            notification.is_read = True
        self.db.commit()
        return notifications

    def delete_notification(self, notification_id: int):
        notification = (
            self._query_non_deleted_notifications(id=notification_id)
            .first()
        )
        if not notification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        
        notification.is_deleted = True
        self.db.commit()
        return notification
