from sqlalchemy import Column, Integer, String, DateTime ,ForeignKey, Boolean
from datetime import datetime
from .database import Base
from sqlalchemy.orm import relationship

class DailyReport(Base):
    __tablename__ = "daily_reports"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    summary = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id")) 
    user = relationship("User", back_populates="reports")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    
    reports = relationship("DailyReport", back_populates="user") 


