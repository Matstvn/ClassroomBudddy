from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.lesson import Lesson
#app.models.lesson import Lesson
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter()

class LessonSave(BaseModel):
    subject_id: int
    date: date
    title: Optional[str] = None
    description: Optional[str] = None
    competencies: Optional[str] = None
    resources: Optional[str] = None
    notes: Optional[str] = None

class LessonResponse(LessonSave):
    id: int
    class Config:
        from_attributes = True

@router.get("/")
def get_lesson(date: date, subject_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter_by(date=date, subject_id=subject_id).first()
    return lesson if lesson else {}

@router.post("/", response_model=LessonResponse)
def save_lesson(data: LessonSave, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter_by(date=data.date, subject_id=data.subject_id).first()
    if lesson:
        for k, v in data.model_dump().items():
            setattr(lesson, k, v)
    else:
        lesson = Lesson(**data.model_dump())
        db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson