from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, crud, schemas, database
from ..auth import get_current_user
from ..models import User
from datetime import datetime

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
    report_data["user_id"] = user.id  # ✅ link by ID
    return crud.create_report(db, report_data)




@router.get("/reports", response_model=list[schemas.ReportOut])
def read_reports(db: Session = Depends(get_db)):
    return crud.get_reports(db)





