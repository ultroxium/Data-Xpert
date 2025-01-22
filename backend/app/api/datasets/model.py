from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    DateTime,
    JSON,
    ForeignKey,
    func,
)
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import Base


class DatasetModel(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(200), nullable=True)
    data = Column(JSON, nullable=False)
    data_metadata = Column(JSON, nullable=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    file_path = Column(String(200), nullable=True)
    api_url = Column(String(200), nullable=True)
    api_headers = Column(JSON, nullable=True)
    is_api_data = Column(Boolean, default=False)
    refresh_period = Column(Integer, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime, nullable=True, default=None)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    is_deleted = Column(Boolean, default=False)

    # Relationships
    # workspace = relationship("WorkspaceModel", back_populates="datasets")
    # charts = relationship("ChartModel", back_populates="dataset")
    creator = relationship("UserModel", foreign_keys=[created_by], back_populates="datasets")
    # updater = relationship("UserModel", foreign_keys=[updated_by])
