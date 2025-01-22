from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, func
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.api.workspaces.teams.model import TeamModel


class WorkspaceModel(Base):
    __tablename__ = "workspaces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    created_by = Column(Integer, ForeignKey('users.id'))
    updated_by = Column(Integer, ForeignKey('users.id'))
    updated_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    team_id = Column(Integer)

    # Relationships
    creator = relationship("UserModel", back_populates="workspaces",foreign_keys=[created_by])
    teams = relationship("TeamModel", back_populates="workspace")
    # members = relationship("WorkspaceMemberModel", back_populates="workspace")
    # updater = relationship("UserModel", foreign_keys=[updated_by])
    # datasets = relationship("DatasetModel", back_populates="workspace")
    # profiles = relationship("UserProfileModel", back_populates="workspace")
    # charts = relationship("ChartModel", back_populates="workspace")
