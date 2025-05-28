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
    edited = Column(Boolean, default=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="reports")

    versions = relationship("ReportVersion", back_populates="original", cascade="all, delete")


class ReportVersion(Base):
    __tablename__ = "report_versions"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("daily_reports.id"))
    title = Column(String)
    summary = Column(String)
    date = Column(DateTime)
    saved_at = Column(DateTime, default=datetime.utcnow)

    original = relationship("DailyReport", back_populates="versions")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)

    reports = relationship("DailyReport", back_populates="user")  


