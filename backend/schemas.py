from pydantic import BaseModel
from datetime import datetime

class ReportCreate(BaseModel):
    title: str
    summary: str
    date: datetime | None = None
    
class ReportOut(ReportCreate):
    id: int
    date: datetime
    user_id: int  

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    name: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    is_admin: bool  

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class MakeAdminRequest(BaseModel):
    username: str