from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
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
    date: str = Query(default=None),  # accept as string
    title: str = Query(default=None),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    query = db.query(models.DailyReport)

    if username:
        print(f"Filtering by username: {username}")
        query = query.join(models.User).filter(models.User.name.ilike(f"%{username}%"))

    if date:
        try:
            parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
            print(f"Filtering for date: {parsed_date}")
            query = query.filter(func.date(models.DailyReport.date) == parsed_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if title:
        print(f"🔎 Filtering by title: {title}")
        query = query.filter(models.DailyReport.title.ilike(f"%{title}%"))

    results = query.all()
    print(f"Found {len(results)} reports")
    return results

