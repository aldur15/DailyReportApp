from sqlalchemy.orm import Session
from . import models, schemas

def create_report(db: Session, report: schemas.ReportCreate):
    db_report = models.DailyReport(**report.dict())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_reports(db: Session):
    return db.query(models.DailyReport).all()
