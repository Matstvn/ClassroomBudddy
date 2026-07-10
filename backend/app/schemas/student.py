from pydantic import BaseModel
from datetime import date
from typing import Optional
from ..models.student import Gender

class StudentBase(BaseModel):
    lrn: Optional[str] = None
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    extension: Optional[str] = None
    gender: Gender
    birth_date: date
    age: int
    mother_tongue: Optional[str] = None
    ip: bool = False
    religion: Optional[str] = None
    address: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    lrn: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    extension: Optional[str] = None
    gender: Optional[Gender] = None
    birth_date: Optional[date] = None
    age: Optional[int] = None
    mother_tongue: Optional[str] = None
    ip: Optional[bool] = None
    religion: Optional[str] = None
    address: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None
    is_active: Optional[bool] = None

class StudentResponse(StudentBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
