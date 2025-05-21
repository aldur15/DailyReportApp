from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, crud, schemas, database
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

@router.post("/reports")
def create_report(report: schemas.ReportCreate, db: Session = Depends(database.get_db), user=Depends(auth.get_current_user)):
    db_report = models.Report(
        title=report.title,
        content=report.content,
        date=report.date or datetime.utcnow(),
        author=report.author or user.name,
        user_id=user.id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report