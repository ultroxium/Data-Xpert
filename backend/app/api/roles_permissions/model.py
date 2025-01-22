from sqlalchemy import Boolean, Column, Integer,ForeignKey, String, DateTime, func
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import Base

class RoleModel(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    description = Column(String(100))
    
    members= relationship("TeamMemberModel", back_populates="roles")
    
    # permissions = relationship("RolePermissionModel", back_populates="role")

class PermissionModel(Base):
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    description = Column(String(100))
    
    # roles = relationship("RolePermissionModel", back_populates="permission")

class RolePermissionModel(Base):
    __tablename__ = "role_permissions"
    
    role_id = Column(Integer, ForeignKey('roles.id'), primary_key=True)
    permission_id = Column(Integer, ForeignKey('permissions.id'), primary_key=True)
    
    # role = relationship("RoleModel", back_populates="permissions")
    # permission = relationship("PermissionModel", back_populates="roles")