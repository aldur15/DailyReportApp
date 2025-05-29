from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import Date, func
from .. import models, crud, schemas, database
from ..auth import get_current_user
from ..models import User
from datetime import datetime, date as date_type

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/reports", response_model=schemas.ReportOut)
def create_report(
    report: schemas.ReportCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    report_data = report.dict()
    report_data["user_id"] = user.id 
    return crud.create_report(db, report_data)


@router.get("/reports", response_model=list[schemas.ReportOut])
def read_reports(db: Session = Depends(get_db)):
    return crud.get_reports(db)


@router.get("/reports/search", response_model=list[schemas.ReportOut])
def search_reports(
    username: str = Query(default=None),
    date: str = Query(default=None),
    title: str = Query(default=None),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    query = db.query(models.DailyReport)

    if username:
        query = query.join(models.User).filter(models.User.name.ilike(f"%{username}%"))

    if date:
        try:
            parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
            query = query.filter(func.date(models.DailyReport.date) == parsed_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if title:
        query = query.filter(models.DailyReport.title.ilike(f"%{title}%"))

    return query.all()


@router.put("/reports/{report_id}", response_model=schemas.ReportOut)
def update_report(
    report_id: int,
    updated_report: schemas.ReportEdit,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    report = db.query(models.DailyReport).options(
        joinedload(models.DailyReport.versions).joinedload(models.ReportVersion.edited_by)
    ).filter(models.DailyReport.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not user.is_admin and report.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your report")

    print(f"Creating version: user_id={user.id}, report_id={report.id}")

    version = models.ReportVersion(
        report_id=report.id,
        title=report.title,
        summary=report.summary,
        date=report.date,
        edited_by_id=user.id  # Track who made the edit
    )
    db.add(version)
    print(version)

    report.title = updated_report.title
    report.summary = updated_report.summary
    report.date = updated_report.date
    report.edited = True

    db.commit()
    db.refresh(report)
    return report




@router.delete("/reports/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    report = db.query(models.DailyReport).options(
        joinedload(models.DailyReport.versions).joinedload(models.ReportVersion.edited_by)
    ).filter(models.DailyReport.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete reports")

    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}


@router.get("/reports/{report_id}/history", response_model=list[schemas.ReportVersionOut])
def get_report_history(
    report_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    
    report = db.query(models.DailyReport).options(
        joinedload(models.DailyReport.versions).joinedload(models.ReportVersion.edited_by)
    ).filter(models.DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not user.is_admin and report.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return report.versions


#retourns reports of only the user
@router.get("/reports/mine", response_model=list[schemas.ReportOut])
def read_my_reports(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    return db.query(models.DailyReport).filter(models.DailyReport.user_id == user.id).all()