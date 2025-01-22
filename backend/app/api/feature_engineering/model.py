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


class ProcessedDataModel(Base):
    __tablename__ = "processed_data"
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    data = Column(String(100), nullable=False)
    version = Column(Integer, nullable=False, default=1)
    data_metadata = Column(JSON, nullable=True)
    status = Column(String(100), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    is_deleted = Column(Boolean, default=False)


    # Relationships
