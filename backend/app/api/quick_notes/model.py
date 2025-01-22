from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, func,DECIMAL
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import Base
from sqlalchemy.sql.sqltypes import TIMESTAMP, Text

class QuickNote(Base):
    __tablename__ = 'quick_notes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'))
    updated_by = Column(Integer, ForeignKey('users.id'))
    workspace_id = Column(Integer, ForeignKey('workspaces.id'))
    dataset_id = Column(Integer, ForeignKey('datasets.id'))
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Define relationships if needed
    creator = relationship("UserModel", foreign_keys=[created_by], back_populates="notes")

    # updater = relationship('User', foreign_keys=[updated_by])
