from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.assessment_subtype import AssessmentSubtype

router = APIRouter()

@router.get("/")
def get_subtypes(db: Session = Depends(get_db)):
    subtypes = db.query(AssessmentSubtype).filter(AssessmentSubtype.is_active == True).all()
    grouped = {}
    for s in subtypes:
        grouped.setdefault(s.parent_type, []).append(s.name)
    return grouped