from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, func,DECIMAL
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import Base

class NotificationModel(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    message= Column(String, nullable=False)
    title = Column(String, nullable=True)
    tag = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # profiles = relationship("UserProfileModel", back_populates="plan")