from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    DateTime,
    JSON,
    ForeignKey,
    func,
    ARRAY,
)
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import Base


class ChartModel(Base):
    __tablename__ = "charts"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, nullable=False)
    label = Column(String, nullable=True)
    description = Column(String, nullable=True)
    column = Column(String, nullable=True)
    dtype = Column(String, nullable=True)
    option = Column(String, nullable=True)
    xAxis = Column(ARRAY(String), nullable=True)
    yAxis = Column(ARRAY(String), nullable=True)
    config= Column(JSON, nullable=True)
    layout= Column(JSON, nullable=True)
    color= Column(String, nullable=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime, nullable=True, default=None, onupdate=datetime.now)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    is_deleted = Column(Boolean, default=False)

    # Relationships
   