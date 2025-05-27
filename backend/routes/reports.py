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
def create_report(report: schemas.ReportCreate, db: Session = Depends(get_db)):
    return crud.create_report(db, report)

@router.get("/reports", response_model=list[schemas.ReportOut])
def read_reports(db: Session = Depends(get_db)):
    print("ad")
    return crud.get_reports(db)





