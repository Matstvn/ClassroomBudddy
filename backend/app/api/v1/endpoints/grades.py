from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.assessment import Assessment, AssessmentSource
from app.models.score import Score
from app.models.term_grade import TermGrade
from app.models.grade_weight import GradeWeight
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# --- Pydantic models ---
class GradeEntry(BaseModel):
    student_id: int
    ww_average: float = 0
    pt_average: float = 0
    te_score: float = 0
    final_grade: float = 0

class GradeSheetRequest(BaseModel):
    subject_id: int
    school_year: str
    term: int
    grades: list[GradeEntry]

class GradeResponse(BaseModel):
    student_id: int
    ww_average: float
    pt_average: float
    te_score: float
    final_grade: float

# --- Helper to get weights ---
def get_weights(db: Session, subject_id: int | None = None):
    # Try subject-specific, fallback to global
    weight = None
    if subject_id:
        weight = db.query(GradeWeight).filter(GradeWeight.subject_id == subject_id).first()
    if not weight:
        weight = db.query(GradeWeight).filter(GradeWeight.subject_id == None).first()
    if not weight:
        # Default weights
        return {"ww": 0.30, "pt": 0.50, "te": 0.20}
    return {"ww": float(weight.ww_weight), "pt": float(weight.pt_weight), "te": float(weight.te_weight)}

# --- Endpoints ---
@router.get("/term-summary", response_model=list[GradeResponse])
def compute_term_summary(
    subject_id: int,
    school_year: str,
    term: int,
    use_saved: bool = False,
    db: Session = Depends(get_db)
):
    if use_saved:
        saved = db.query(TermGrade).filter(
            TermGrade.subject_id == subject_id,
            TermGrade.school_year == school_year,
            TermGrade.term == term
        ).all()
        if saved:
            return [GradeResponse(
                student_id=g.student_id,
                ww_average=float(g.ww_average),
                pt_average=float(g.pt_average),
                te_score=float(g.te_score),
                final_grade=float(g.final_grade)
            ) for g in saved]

    # Fetch all assessments for this subject/term/school_year (source=grades or classroom – we want all)
    assessments = db.query(Assessment).filter(
        Assessment.subject_id == subject_id,
        Assessment.school_year == school_year,
        Assessment.term == term
    ).all()

    # Group by type
    student_data = {}  # {student_id: {ww_scores: [], pt_scores: [], te_score: None}}
    from app.models.student import Student
    students = db.query(Student).filter(Student.is_active == True).all()
    for s in students:
        student_data[s.id] = {"ww_scores": [], "pt_scores": [], "te_score": None}

    for a in assessments:
        type_lower = a.type.lower()
        scores = {s.student_id: s.score for s in a.scores}
        for sid in student_data:
            if sid in scores:
                pct = (scores[sid] / a.total_score) * 100 if a.total_score else 0
                if "written" in type_lower or type_lower in ("quiz", "seatwork", "homework"):
                    student_data[sid]["ww_scores"].append(pct)
                elif "performance" in type_lower or type_lower == "performance task":
                    student_data[sid]["pt_scores"].append(pct)
                elif "term" in type_lower or "examination" in type_lower:
                    student_data[sid]["te_score"] = pct   # take the latest?

    weights = get_weights(db, subject_id)
    result = []
    for sid, data in student_data.items():
        ww_avg = sum(data["ww_scores"]) / len(data["ww_scores"]) if data["ww_scores"] else 0
        pt_avg = sum(data["pt_scores"]) / len(data["pt_scores"]) if data["pt_scores"] else 0
        te = data["te_score"] if data["te_score"] is not None else 0
        final = (ww_avg * weights["ww"]) + (pt_avg * weights["pt"]) + (te * weights["te"])
        result.append(GradeResponse(
            student_id=sid,
            ww_average=round(ww_avg, 2),
            pt_average=round(pt_avg, 2),
            te_score=round(te, 2),
            final_grade=round(final, 2)
        ))

    return result

@router.post("/save")
def save_term_grades(data: GradeSheetRequest, db: Session = Depends(get_db)):
    for entry in data.grades:
        db.query(TermGrade).filter(
            TermGrade.student_id == entry.student_id,
            TermGrade.subject_id == data.subject_id,
            TermGrade.school_year == data.school_year,
            TermGrade.term == data.term
        ).delete()
        db.add(TermGrade(
            student_id=entry.student_id,
            subject_id=data.subject_id,
            school_year=data.school_year,
            term=data.term,
            ww_average=entry.ww_average,
            pt_average=entry.pt_average,
            te_score=entry.te_score,
            final_grade=entry.final_grade
        ))
    db.commit()
    return {"message": "Grades saved successfully."}

# --- Weight endpoints ---
@router.get("/weights")
def get_all_weights(db: Session = Depends(get_db)):
    weights = db.query(GradeWeight).all()
    return [{"subject_id": w.subject_id, "ww_weight": float(w.ww_weight),
             "pt_weight": float(w.pt_weight), "te_weight": float(w.te_weight)} for w in weights]

@router.post("/weights")
def set_weight(ww: float, pt: float, te: float, subject_id: Optional[int] = None, db: Session = Depends(get_db)):
    if subject_id:
        w = db.query(GradeWeight).filter(GradeWeight.subject_id == subject_id).first()
        if not w:
            w = GradeWeight(subject_id=subject_id)
            db.add(w)
    else:
        w = db.query(GradeWeight).filter(GradeWeight.subject_id == None).first()
        if not w:
            w = GradeWeight(subject_id=None)
            db.add(w)
    w.ww_weight = ww
    w.pt_weight = pt
    w.te_weight = te
    db.commit()
    return {"message": "Weight updated."}