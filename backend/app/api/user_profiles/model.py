from sqlalchemy import Boolean, Column, Integer, String, DateTime, func,ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.api.plans.model import PlanModel


class UserProfileModel(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    plan_id = Column(Integer, ForeignKey('plans.id'))
    current_workspace = Column(Integer, ForeignKey('workspaces.id'))
    role = Column(String(50), default='Viewer')
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Define relationships
    # user = relationship("UserModel", back_populates="profiles")
    # plan = relationship("PlanModel")  # Make sure PlanModel is defined
    # workspace = relationship("WorkspaceModel")  # Make sure WorkspaceModel is defined