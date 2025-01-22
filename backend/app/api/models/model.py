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

class ModelListModel(Base):
    __tablename__ = 'model_lists'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=True)
    key = Column(String(255), nullable=True)
    description = Column(String, nullable=True)
    category = Column(String(255), nullable=True)
    isbasic = Column(Boolean, default=False)

    # Relationships
    ai_models = relationship("AIModel", back_populates="model")


class AIModel(Base):
    __tablename__ = "models"
    id = Column(Integer, primary_key=True, index=True)
    processed_data_id = Column(Integer, ForeignKey("processed_data.id"))
    name = Column(String(100), nullable=True)
    status = Column(String(100), nullable=True)
    model_id = Column(Integer, ForeignKey("model_lists.id"))
    target_column = Column(String(100), nullable=True)
    target_encoder_path = Column(String(100), nullable=True)
    version = Column(Integer,nullable=True, default=1)
    model_file_path = Column(String(100), nullable=False)
    model_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.now())
    is_trained = Column(Boolean, default=False)
    input_columns = Column(JSON, nullable=True)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    model = relationship("ModelListModel", back_populates="ai_models")
