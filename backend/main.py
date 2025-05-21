from fastapi import FastAPI
from . import models, database
from .routes import auth, reports
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=database.engine)

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
#pip freeze > requirements.txt
#uvicorn backend.main:app --reload
#http://127.0.0.1:8000/docs
                   

