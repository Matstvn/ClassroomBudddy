from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.attendance import Attendance, AttendanceStatus, SessionEnum
from app.models.student import Student
from pydantic import BaseModel
from datetime import date

router = APIRouter()

class AttendanceBulk(BaseModel):
    date: date
    session: SessionEnum
    records: list[dict]   # [{"student_id": 1, "status": "present"}, ...]

@router.post("/bulk")
def save_attendance(data: AttendanceBulk, db: Session = Depends(get_db)):
    for rec in data.records:
        existing = db.query(Attendance).filter_by(
            student_id=rec["student_id"],
            date=data.date,
            session=data.session
        ).first()
        if existing:
            existing.status = rec["status"]
        else:
            db.add(Attendance(
                student_id=rec["student_id"],
                date=data.date,
                session=data.session,
                status=rec["status"]
            ))
    db.commit()
    return {"message": "Attendance saved"}

@router.get("/")
def get_attendance(date: date, session: SessionEnum, db: Session = Depends(get_db)):
    records = db.query(Attendance).filter_by(date=date, session=session).all()
    return [{"student_id": r.student_id, "status": r.status.value} for r in records]