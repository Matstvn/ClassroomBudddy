from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.subject import Subject
from pydantic import BaseModel

router = APIRouter()

class SubjectCreate(BaseModel):
    name: str
    code: str | None = None

class SubjectResponse(BaseModel):
    id: int
    name: str
    code: str | None

    class Config:
        from_attributes = True

@router.get("/", response_model=list[SubjectResponse])
def list_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).all()

@router.post("/", response_model=SubjectResponse, status_code=201)
def create_subject(subj: SubjectCreate, db: Session = Depends(get_db)):
    exists = db.query(Subject).filter(Subject.name == subj.name).first()
    if exists:
        raise HTTPException(400, "Subject already exists")
    db_subj = Subject(**subj.model_dump())
    db.add(db_subj)
    db.commit()
    db.refresh(db_subj)
    return db_subj

@router.delete("/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    subj = db.query(Subject).get(subject_id)
    if not subj:
        raise HTTPException(404, "Subject not found")
    db.delete(subj)
    db.commit()
    return {"message": "Subject deleted"}