
from sqlalchemy import Boolean, Column, Integer, String, DateTime, func,ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.api.roles_permissions.model import RoleModel
from app.api.auth.model import UserModel


class TeamMemberModel(Base):
    __tablename__ = "team_members"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey('teams.id'))
    user_id = Column(Integer, ForeignKey('users.id'),nullable=True)
    role_id = Column(Integer, ForeignKey('roles.id'))
    workspace_id= Column(Integer, ForeignKey('workspaces.id'))
    email = Column(String(255), unique=True, index=True)
    status = Column(String(20), default="pending")
    
    team = relationship("TeamModel", back_populates="members")
    roles = relationship("RoleModel", back_populates="members")
    user_obj = relationship("UserModel", back_populates="members")
    # user = relationship("UserModel", back_populates="teams")