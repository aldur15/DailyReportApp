from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models, database, schemas
from .database import SessionLocal


# SECRET
SECRET_KEY = "YOUR_SECRET_KEY"  # use os.environ in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30  # ~1 month

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")  # same as /login route

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)  
):
    from jose import JWTError, jwt
    from fastapi import HTTPException, status

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, "YOUR_SECRET_KEY", algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def update_report(db: Session, report_id: int, data: schemas.ReportEdit, user: models.User):
    report = db.query(models.DailyReport).filter(models.DailyReport.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your report")

    # Save version
    version = models.ReportVersion(
        report_id=report.id,
        title=report.title,
        summary=report.summary,
        date=report.date
    )
    db.add(version)

    report.title = data.title
    report.summary = data.summary
    report.date = data.date
    report.edited = True

    db.commit()
    db.refresh(report)
    return report

