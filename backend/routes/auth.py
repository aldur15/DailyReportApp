from fastapi import APIRouter, HTTPException, Depends, status, Body
from sqlalchemy.orm import Session
from .. import schemas, models, database, auth

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.name == user.name).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    hashed = auth.hash_password(user.password)
    new_user = models.User(name=user.name, hashed_password=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserCreate = Body(...), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.name == user.name).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/make-admin")
def make_user_admin(
    request: schemas.MakeAdminRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.is_admin == False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can promote users"
        )

    user_to_promote = db.query(models.User).filter(models.User.name == request.username).first()
    if not user_to_promote:
        raise HTTPException(status_code=404, detail="User not found")

    if user_to_promote.is_admin == True:
        return {"message": f"User '{request.username}' is already an admin"}

    user_to_promote.is_admin = True
    db.commit()
    return {"message": f"User '{request.username}' has been promoted to admin"}

@router.get("/users/me", response_model=schemas.UserOut)
def get_current_user_info(
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user
