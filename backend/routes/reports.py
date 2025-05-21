from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, database
from ..auth import get_current_user
from ..models import User

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
    return crud.get_reports(db)


@router.post("/reports", response_model=schemas.ReportOut)
def create_report(
    report: schemas.ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.create_report(db, report)

@router.get("/reports", response_model=list[schemas.ReportOut])
def read_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_reports(db)