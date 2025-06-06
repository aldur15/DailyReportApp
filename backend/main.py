from fastapi import FastAPI
from . import models, database
from .routes import auth, reports
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=database.engine)

#create admin role
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from . import models, database

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def create_admin():
    db: Session = database.SessionLocal()
    existing_admin = db.query(models.User).filter(models.User.name == "admin").first()
    if not existing_admin:
        admin_user = models.User(
            name="admin",
            hashed_password=pwd_context.hash("admin"),
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        print("Admin user created.")
    else:
        print("Admin already exists.")

    existing_non_admin = db.query(models.User).filter(models.User.name == "nonadmin").first()
    if not existing_non_admin:
        nonadmin_user = models.User(
            name="nonadmin",
            hashed_password=pwd_context.hash("password"),
            is_admin=False
        )
        db.add(nonadmin_user)
        db.commit()
        print("nonadmin user created.")
    else:
        print("nonadmin already exists.")

    existing_user = db.query(models.User).filter(models.User.name == "user").first()
    if not existing_user:
        user = models.User(
            name="user",
            hashed_password=pwd_context.hash("password"),
            is_admin=False
        )
        db.add(user)
        db.commit()
        print("user user created.")
    else:
        print("user already exists.")
    db.close()

create_admin()

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(reports.router)




#venv\Scripts\activate
#linux: source venv/bin/activate
#pip freeze > requirements.txt
#uvicorn backend.main:app --reload
#http://127.0.0.1:8000/docs


