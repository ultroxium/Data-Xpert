from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, func,DECIMAL
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.database import Base

class PlanModel(Base):
    __tablename__ = "plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), index=True)
    price = Column(DECIMAL(10, 2), default=0.00)
    max_workspaces = Column(Integer)
    max_datasets_per_workspace = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class SubscriptionModel(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    plan_id = Column(Integer, ForeignKey('plans.id'),default=1)
    start_date = Column(DateTime, default=datetime.utcnow)
    next_payment_date = Column(DateTime, nullable=True)
    status = Column(String(50), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class PaymentModel(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey('subscriptions.id'))
    stripe_payment_id = Column(String(255), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default='succeeded')
    payment_method = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
