from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.assessment import Assessment, AssessmentSource
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter()

# --- Pydantic schemas ---
class ScoreEntry(BaseModel):
    student_id: int
    score: float

class AssessmentCreate(BaseModel):
    subject_id: int
    date: date
    type: str = "quiz"
    title: str
    total_score: int = 0
    description: Optional[str] = None
    scores: list[ScoreEntry] = []
    # New fields
    source: AssessmentSource = AssessmentSource.GRADES
    school_year: Optional[str] = None
    term: Optional[int] = None
    learning_objective_id: Optional[str] = None
    

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    total_score: Optional[int] = None
    learning_objectives_id: Optional[int] = None
    scores: Optional[list[ScoreEntry]] = None   # if provided, replaces all scores

class AssessmentResponse(BaseModel):
    id: int
    subject_id: int
    date: date
    type: str
    title: str
    total_score: int
    description: Optional[str]
    source: str
    school_year: Optional[str]
    term: Optional[int]
    learning_objectives: Optional[str]
    scores: list[ScoreEntry] = []

    class Config:
        from_attributes = True

# --- Endpoints ---
@router.post("/", response_model=AssessmentResponse)
def create_assessment(data: AssessmentCreate, db: Session = Depends(get_db)):
    from app.models.score import Score
    assessment = Assessment(
        subject_id=data.subject_id,
        date=data.date,
        type=data.type,
        title=data.title,
        total_score=data.total_score,
        description=data.description,
        source=data.source,
        school_year=data.school_year,
        term=data.term,
        learning_objective=data.learning_objectives,
    )
    db.add(assessment)
    db.flush()

    for s in data.scores:
        db.add(Score(assessment_id=assessment.id, student_id=s.student_id, score=s.score))
    db.commit()
    db.refresh(assessment)

    scores_out = [{"student_id": s.student_id, "score": s.score} for s in assessment.scores]
    return AssessmentResponse(
        id=assessment.id,
        subject_id=assessment.subject_id,
        date=assessment.date,
        type=assessment.type,
        title=assessment.title,
        total_score=assessment.total_score,
        description=assessment.description,
        source=assessment.source.value,
        school_year=assessment.school_year,
        term=assessment.term,
        learning_objectives=assessment.learning_objective,
        learning_objective_id = data.learning_objective_id,
        scores=scores_out,
    )

@router.get("/grade-entry")
def get_assessments_for_grades(
    subject_id: int,
    school_year: str,
    term: int,
    date: Optional[date] = None,   # <-- new
    type: Optional[str] = None,
    subtype: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Assessment).filter(
        Assessment.subject_id == subject_id,
        Assessment.school_year == school_year,
        Assessment.term == term,
        Assessment.source == AssessmentSource.GRADES
    )
    if date:
        query = query.filter(Assessment.date == date)
    if type:
        query = query.filter(Assessment.type == type)
    if subtype:
        query = query.filter(Assessment.type == subtype)

    assessments = query.all()
    result = []
    for a in assessments:
        scores = [{"student_id": s.student_id, "score": s.score} for s in a.scores]

        # Fetch linked objective info if available
        obj_code = None
        obj_desc = None
        if a.learning_objective_id:
            from app.models.learning_objective import LearningObjective
            obj = db.query(LearningObjective).get(a.learning_objective_id)
            if obj:
                obj_code = obj.code
                obj_desc = obj.description

        result.append({
            "id": a.id,
            "subject_id": a.subject_id,
            "date": str(a.date),
            "type": a.type,
            "title": a.title,
            "total_score": a.total_score,
            "description": a.description,
            "source": a.source.value,
            "school_year": a.school_year,
            "term": a.term,
            "learning_objective_id": a.learning_objective_id,
            "learning_objective_code": obj_code,
            "learning_objective_description": obj_desc,
            "scores": scores,
        })
    return result


@router.put("/{assessment_id}")
def update_assessment(assessment_id: int, data: AssessmentUpdate, db: Session = Depends(get_db)):
    from app.models.score import Score
    assessment = db.query(Assessment).get(assessment_id)
    if not assessment:
        raise HTTPException(404, "Assessment not found")

    if data.title is not None:
        assessment.title = data.title
    if data.total_score is not None:
        assessment.total_score = data.total_score
    if data.learning_objectives is not None:
        assessment.learning_objectives = data.learning_objectives

    if data.scores is not None:
        # Replace existing scores
        db.query(Score).filter(Score.assessment_id == assessment.id).delete()
        for s in data.scores:
            db.add(Score(assessment_id=assessment.id, student_id=s.student_id, score=s.score))

    db.commit()
    db.refresh(assessment)

    scores_out = [{"student_id": s.student_id, "score": s.score} for s in assessment.scores]
    return AssessmentResponse(
        id=assessment.id,
        subject_id=assessment.subject_id,
        date=assessment.date,
        type=assessment.type,
        title=assessment.title,
        total_score=assessment.total_score,
        description=assessment.description,
        source=assessment.source.value,
        school_year=assessment.school_year,
        term=assessment.term,
        learning_objectives=assessment.learning_objectives,
        scores=scores_out,
    )


@router.get("/{assessment_id}")
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    a = db.query(Assessment).get(assessment_id)
    if not a:
        raise HTTPException(404, "Assessment not found")
    scores = [{"student_id": s.student_id, "score": s.score} for s in a.scores]
    # Include objective info
    obj_desc = None
    if a.learning_objective_id:
        from app.models.learning_objective import LearningObjective
        obj = db.query(LearningObjective).get(a.learning_objective_id)
        if obj:
            obj_desc = obj.description
    return {
        "id": a.id,
        "subject_id": a.subject_id,
        "date": str(a.date),
        "type": a.type,
        "title": a.title,
        "total_score": a.total_score,
        "source": a.source.value,
        "school_year": a.school_year,
        "term": a.term,
        "learning_objective_id": a.learning_objective_id,
        "learning_objective_description": obj_desc,
        "learning_objectives": a.learning_objectives,
        "scores": scores
    }