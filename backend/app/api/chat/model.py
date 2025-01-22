from pandas import Index
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, func,DECIMAL
from datetime import datetime, timedelta
from sqlalchemy.orm import relationship
from app.database.database import Base

class ChatModel(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    message= Column(String, nullable=False)
    speaker = Column(String, nullable=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserRateLimit(Base):
    __tablename__ = 'user_rate_limits'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    request_count = Column(Integer, default=0)
    last_reset = Column(DateTime, default=func.now())

    @property
    def is_limit_reached(self):
        # Reset the request count every 1 hour
        if self.last_reset < datetime.utcnow() - timedelta(hours=6):
            self.request_count = 0
            self.last_reset = datetime.utcnow()
            return False
        return self.request_count >= 10