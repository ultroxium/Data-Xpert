
from sqlalchemy import Boolean, Column, Integer, String, DateTime, func,ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.api.workspaces.teams.members_model import TeamMemberModel
from app.api.workspaces.teams.members_model import TeamMemberModel


class TeamModel(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    workspace_id = Column(Integer, ForeignKey('workspaces.id'))
    created_by = Column(Integer, ForeignKey('users.id'))
    updated_by = Column(Integer, ForeignKey('users.id'))
    updated_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    
    workspace = relationship("WorkspaceModel", back_populates="teams")
    members = relationship("TeamMemberModel", back_populates="team")