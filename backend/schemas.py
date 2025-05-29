from pydantic import BaseModel
from datetime import datetime
from typing import Optional

##USERS
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

##REPORTS
class ReportCreate(BaseModel):
    title: str
    summary: str
    date: datetime | None = None

class ReportUser(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class ReportOut(ReportCreate):
    id: int
    date: datetime
    edited: bool = False
    user: ReportUser  

    class Config:
        from_attributes = True

class ReportEdit(BaseModel):
    title: str
    summary: str
    date: datetime

class ReportVersionOut(BaseModel):
    title: str
    summary: str
    date: datetime
    saved_at: datetime
    edited_by: Optional[UserOut]

    class Config:
        orm_mode = True


