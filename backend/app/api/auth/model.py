from sqlalchemy import Boolean, Column, Integer, String, DateTime, func
from datetime import datetime
from sqlalchemy.orm import relationship
from app.api.datasets.model import DatasetModel
from app.database.database import Base

class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(255), unique=True, index=True)
    password = Column(String(100))
    otp = Column(String(6), nullable=True)
    otp_expiry = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    google_id = Column(String(100),unique=True)
    github_id = Column(String(100),unique=True)
    picture = Column(String(255), nullable=True)
    verified_at = Column(DateTime, nullable=True, default=None)
    registered_at = Column(DateTime, nullable=True, default=None)
    updated_at = Column(DateTime, nullable=True, default=None, onupdate=datetime.now)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    is_deleted = Column(Boolean, default=False)

    # Define relationships
    workspaces = relationship("WorkspaceModel",foreign_keys="WorkspaceModel.created_by", back_populates="creator")
    members= relationship("TeamMemberModel", back_populates="user_obj")
    datasets = relationship("DatasetModel", back_populates="creator", foreign_keys="DatasetModel.created_by")
    notes = relationship("QuickNote", back_populates="creator",foreign_keys="QuickNote.created_by")
    # notifications = relationship("NotificationModel", back_populates="user")
    # tickets = relationship("TicketModel", back_populates="user")
    # api_keys = relationship("ApiKeyModel", back_populates="user")
    # audit_logs = relationship("AuditLogModel", back_populates="user")