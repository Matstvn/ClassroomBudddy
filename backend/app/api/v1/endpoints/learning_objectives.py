from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.learning_objective import LearningObjective
from app.models.learning_competency import LearningCompetency
from app.models.performance_standard import PerformanceStandard
from pydantic import BaseModel

router = APIRouter()

class ObjectiveCreate(BaseModel):
    code: str
    description: str
    learning_competency_id: int

class ObjectiveResponse(BaseModel):
    id: int
    code: str
    description: str
    learning_competency_id: int
    class Config:
        from_attributes = True


@router.get("/")
def list_objectives(
    subject_id: int,
    term: int,
    school_year: str,
    db: Session = Depends(get_db)
):
    # Join through competencies -> performance_standards to filter by subject/term/school_year
    objectives = (
        db.query(LearningObjective)
        .join(LearningObjective.competency)
        .join(LearningCompetency.performance_standard)
        .filter(
            PerformanceStandard.subject_id == subject_id,
            PerformanceStandard.term == term,
            PerformanceStandard.school_year == school_year
        )
        .all()
    )

    result = []
    for obj in objectives:
        comp = obj.competency
        ps = comp.performance_standard
        result.append({
            "id": obj.id,
            "description": obj.description,
            "competency_code": comp.code,
            "competency_description": comp.description,
            "performance_standard_code": ps.code,
            "performance_standard_description": ps.description
        })
    return result

@router.post("/", response_model=ObjectiveResponse, status_code=201)
def create_objective(data: ObjectiveCreate, db: Session = Depends(get_db)):
    obj = LearningObjective(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{objective_id}", response_model=ObjectiveResponse)
def update_objective(objective_id: int, data: ObjectiveCreate, db: Session = Depends(get_db)):
    obj = db.query(LearningObjective).get(objective_id)
    if not obj:
        raise HTTPException(404, "Not found")
    for k, v in data.model_dump().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{objective_id}")
def delete_objective(objective_id: int, db: Session = Depends(get_db)):
    obj = db.query(LearningObjective).get(objective_id)
    if not obj:
        raise HTTPException(404, "Not found")
    db.delete(obj)
    db.commit()
    return {"message": "Deleted"}