from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.performance_standard import PerformanceStandard
from app.models.learning_competency import LearningCompetency
from app.models.learning_objective import LearningObjective
from app.models.assessment import Assessment
from app.models.score import Score
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# --- Helper function to compute class average of an objective ---
def compute_objective_class_average(db: Session, objective_id: int) -> float | None:
    # Find assessments linked to this objective
    assessments = db.query(Assessment).filter(
        Assessment.learning_objective_id == objective_id
    ).all()
    if not assessments:
        return None

    total_percent = 0.0
    count = 0
    for assessment in assessments:
        scores = db.query(Score).filter(Score.assessment_id == assessment.id).all()
        if not scores or assessment.total_score == 0:
            continue
        class_sum = sum(s.score for s in scores)
        class_avg = (class_sum / (len(scores) * assessment.total_score)) * 100
        total_percent += class_avg
        count += 1

    if count == 0:
        return None
    return round(total_percent / count, 2)

# --- Pydantic response models ---
class ObjectiveProgress(BaseModel):
    id: int
    description: str
    class_average: Optional[float] = None  # null if no data

class CompetencyProgress(BaseModel):
    id: int
    description: str
    progress: Optional[float] = None  # average of objectives' class averages
    objectives: list[ObjectiveProgress]

class PerformanceStandardProgress(BaseModel):
    id: int
    description: str
    competencies: list[CompetencyProgress]

class CurriculumProgressResponse(BaseModel):
    performance_standards: list[PerformanceStandardProgress]

# --- Endpoint ---
@router.get("/progress", response_model=CurriculumProgressResponse)
def get_curriculum_progress(
    subject_id: int,
    term: int,
    school_year: str,
    db: Session = Depends(get_db)
):
    ps_list = db.query(PerformanceStandard).filter(
        PerformanceStandard.subject_id == subject_id,
        PerformanceStandard.term == term,
        PerformanceStandard.school_year == school_year
    ).all()

    result = []
    for ps in ps_list:
        comps = []
        for comp in ps.competencies:   # thanks to relationship
            objectives = []
            obj_avgs = []
            for obj in comp.objectives:
                avg = compute_objective_class_average(db, obj.id)
                objectives.append(ObjectiveProgress(
                    id=obj.id, description=obj.description, class_average=avg
                ))
                if avg is not None:
                    obj_avgs.append(avg)

            comp_avg = round(sum(obj_avgs) / len(obj_avgs), 2) if obj_avgs else None
            comps.append(CompetencyProgress(
                id=comp.id, description=comp.description,
                progress=comp_avg, objectives=objectives
            ))
        result.append(PerformanceStandardProgress(
            id=ps.id, description=ps.description, competencies=comps
        ))

    return CurriculumProgressResponse(performance_standards=result)