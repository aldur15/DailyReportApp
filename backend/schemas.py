from pydantic import BaseModel
from datetime import datetime

class ReportCreate(BaseModel):
    title: str
    summary: str
    date: datetime | None = None
    
class ReportOut(ReportCreate):
    id: int
    date: datetime

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    name: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    role: str  

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class MakeAdminRequest(BaseModel):
    username: str