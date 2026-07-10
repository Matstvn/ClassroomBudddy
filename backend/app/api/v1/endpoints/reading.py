from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.reading_passage import ReadingPassage
from app.models.reading_question import ReadingQuestion
from app.models.reading_assessment import ReadingAssessment
from app.models.reading_assessment_answer import ReadingAssessmentAnswer
from app.models.reading_level_history import ReadingLevelHistory
from app.models.student import Student
from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional
from app.models.orf_assessment import OrfAssessment
from app.models.orf_error_word import OrfErrorWord

router = APIRouter()

# ---------- Passage Schemas ----------
class PassageCreate(BaseModel):
    title: str
    content: str
    level: str
    passage_type: str = "comprehension"

class PassageResponse(PassageCreate):
    id: int
    created_at: str
    class Config:
        from_attributes = True

# ---------- Question Schemas ----------
class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str = Field(..., pattern="^[A-D]$")

class QuestionResponse(QuestionCreate):
    id: int
    passage_id: int
    class Config:
        from_attributes = True

# ---------- Assessment Schemas ----------
class AnswerEntry(BaseModel):
    question_id: int
    chosen_answer: str = Field(..., pattern="^[A-D]$")

class AssessmentCreate(BaseModel):
    student_id: int
    passage_id: int
    assessment_date: date
    answers: List[AnswerEntry]

class AssessmentResponse(BaseModel):
    id: int
    student_id: int
    passage_id: int
    assessment_date: date
    total_questions: int
    total_correct: int
    percentage: float
    xp_earned: int
    answers: List[AnswerEntry] = []

    class Config:
        from_attributes = True

# ---------- Level Schemas ----------
class LevelUpdate(BaseModel):
    new_level: str

# ---------- ORF Schemas ----------
class OrfAssessmentCreate(BaseModel):
    student_id: int
    passage_id: int
    assessment_date: date
    time_seconds: int
    error_word_indices: List[int] = []

class OrfAssessmentResponse(BaseModel):
    id: int
    student_id: int
    passage_id: int
    passage_title: str = ""
    assessment_date: date
    time_seconds: int
    total_words: int
    error_count: int
    wcpm: float
    accuracy: float
    error_word_indices: List[int] = []

    class Config:
        from_attributes = True

# ========== ORF Endpoints ==========
@router.post("/orf/", response_model=OrfAssessmentResponse, status_code=201)
def create_orf_assessment(data: OrfAssessmentCreate, db: Session = Depends(get_db)):
    # Validate student
    student = db.query(Student).get(data.student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    # Validate passage
    passage = db.query(ReadingPassage).get(data.passage_id)
    if not passage:
        raise HTTPException(404, "Passage not found")

    # Count total words (split by whitespace)
    words = passage.content.split()
    total_words = len(words)

    # Validate error indices (they must be within range)
    for idx in data.error_word_indices:
        if idx < 0 or idx >= total_words:
            raise HTTPException(400, f"Invalid word index: {idx}")

    error_count = len(data.error_word_indices)
    time_minutes = data.time_seconds / 60.0
    wcpm = ((total_words - error_count) / time_minutes) if time_minutes > 0 else 0.0
    accuracy = ((total_words - error_count) / total_words) * 100 if total_words > 0 else 0.0

    # Create assessment
    assessment = OrfAssessment(
        student_id=data.student_id,
        passage_id=data.passage_id,
        assessment_date=data.assessment_date,
        time_seconds=data.time_seconds,
        total_words=total_words,
        error_count=error_count,
        wcpm=round(wcpm, 2),
        accuracy=round(accuracy, 2)
    )
    db.add(assessment)
    db.flush()

    # Insert error words
    for idx in data.error_word_indices:
        db.add(OrfErrorWord(assessment_id=assessment.id, word_index=idx))

    db.commit()
    db.refresh(assessment)

    # Build response
    return OrfAssessmentResponse(
        id=assessment.id,
        student_id=assessment.student_id,
        passage_id=assessment.passage_id,
        passage_title=passage.title,
        assessment_date=assessment.assessment_date,
        time_seconds=assessment.time_seconds,
        total_words=assessment.total_words,
        error_count=assessment.error_count,
        wcpm=float(assessment.wcpm),
        accuracy=float(assessment.accuracy),
        error_word_indices=[ew.word_index for ew in assessment.error_words]
    )

@router.get("/orf/", response_model=List[OrfAssessmentResponse])
def list_orf_assessments(
    student_id: int,
    passage_id: Optional[int] = None,
    date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(OrfAssessment).filter(OrfAssessment.student_id == student_id)
    if passage_id:
        query = query.filter(OrfAssessment.passage_id == passage_id)
    if date:
        query = query.filter(OrfAssessment.assessment_date == date)

    assessments = query.order_by(OrfAssessment.assessment_date.desc()).all()

    result = []
    for a in assessments:
        # Eagerly load error words (they should be loaded by relationship)
        result.append(OrfAssessmentResponse(
            id=a.id,
            student_id=a.student_id,
            passage_id=a.passage_id,
            passage_title=a.passage.title if a.passage else "",
            assessment_date=a.assessment_date,
            time_seconds=a.time_seconds,
            total_words=a.total_words,
            error_count=a.error_count,
            wcpm=float(a.wcpm),
            accuracy=float(a.accuracy),
            error_word_indices=[ew.word_index for ew in a.error_words]
        ))
    return result

# ========== Passage CRUD ==========
@router.post("/passages/", response_model=PassageResponse, status_code=201)
def create_passage(data: PassageCreate, db: Session = Depends(get_db)):
    passage = ReadingPassage(**data.model_dump())
    db.add(passage)
    db.commit()
    db.refresh(passage)
    return passage

@router.get("/passages/", response_model=List[PassageResponse])
def list_passages(level: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ReadingPassage)
    if level:
        query = query.filter(ReadingPassage.level == level)
    return query.all()

@router.put("/passages/{passage_id}", response_model=PassageResponse)
def update_passage(passage_id: int, data: PassageCreate, db: Session = Depends(get_db)):
    passage = db.query(ReadingPassage).get(passage_id)
    if not passage:
        raise HTTPException(404, "Passage not found")
    for k, v in data.model_dump().items():
        setattr(passage, k, v)
    db.commit()
    db.refresh(passage)
    return passage

@router.delete("/passages/{passage_id}")
def delete_passage(passage_id: int, db: Session = Depends(get_db)):
    passage = db.query(ReadingPassage).get(passage_id)
    if not passage:
        raise HTTPException(404, "Passage not found")
    db.delete(passage)
    db.commit()
    return {"message": "Passage deleted"}

# ========== Question CRUD ==========
@router.post("/passages/{passage_id}/questions/", response_model=QuestionResponse, status_code=201)
def add_question(passage_id: int, data: QuestionCreate, db: Session = Depends(get_db)):
    passage = db.query(ReadingPassage).get(passage_id)
    if not passage:
        raise HTTPException(404, "Passage not found")
    question = ReadingQuestion(passage_id=passage_id, **data.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question

@router.get("/passages/{passage_id}/questions/", response_model=List[QuestionResponse])
def list_questions(passage_id: int, db: Session = Depends(get_db)):
    passage = db.query(ReadingPassage).get(passage_id)
    if not passage:
        raise HTTPException(404, "Passage not found")
    return passage.questions

@router.put("/questions/{question_id}", response_model=QuestionResponse)
def update_question(question_id: int, data: QuestionCreate, db: Session = Depends(get_db)):
    question = db.query(ReadingQuestion).get(question_id)
    if not question:
        raise HTTPException(404, "Question not found")
    for k, v in data.model_dump().items():
        setattr(question, k, v)
    db.commit()
    db.refresh(question)
    return question

@router.delete("/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(ReadingQuestion).get(question_id)
    if not question:
        raise HTTPException(404, "Question not found")
    db.delete(question)
    db.commit()
    return {"message": "Question deleted"}

# ========== Assessment (with retake logic) ==========
ALLOWED_LEVELS = {
    "Tiny Spark", "Word Weaver", "Sentence Sorcerer", "Story Magician",
    "Wizard of Words", "Archmage of Reading", "Keeper of the Library",
    "Legend of the Written Realm"
}

@router.post("/assessments/", response_model=AssessmentResponse)
def save_assessment(data: AssessmentCreate, db: Session = Depends(get_db)):
    # Verify student exists
    student = db.query(Student).get(data.student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    # Verify passage exists and has questions
    passage = db.query(ReadingPassage).get(data.passage_id)
    if not passage:
        raise HTTPException(404, "Passage not found")
    questions = passage.questions
    if not questions:
        raise HTTPException(400, "Passage has no questions")

    # Check existing assessment for today
    existing = db.query(ReadingAssessment).filter(
        ReadingAssessment.student_id == data.student_id,
        ReadingAssessment.passage_id == data.passage_id,
        ReadingAssessment.assessment_date == data.assessment_date
    ).first()

    if existing:
        if existing.percentage >= 80.0:
            raise HTTPException(400, "Retake not allowed: score is already 80% or above")
        # Delete old answers and assessment to allow retake
        db.query(ReadingAssessmentAnswer).filter(
            ReadingAssessmentAnswer.assessment_id == existing.id
        ).delete()
        db.delete(existing)
        db.commit()

    # Map questions for quick lookup
    qmap = {q.id: q for q in questions}

    assessment = ReadingAssessment(
        student_id=data.student_id,
        passage_id=data.passage_id,
        assessment_date=data.assessment_date,
        total_questions=len(questions),
        total_correct=0,
        percentage=0.0,
        xp_earned=0
    )
    db.add(assessment)
    db.flush()

    total_correct = 0
    for entry in data.answers:
        q = qmap.get(entry.question_id)
        if not q:
            continue   # ignore invalid question IDs
        is_correct = entry.chosen_answer.upper() == q.correct_answer.upper()
        if is_correct:
            total_correct += 1
        ans = ReadingAssessmentAnswer(
            assessment_id=assessment.id,
            question_id=entry.question_id,
            chosen_answer=entry.chosen_answer.upper(),
            is_correct=is_correct
        )
        db.add(ans)

    # Update computed fields
    assessment.total_correct = total_correct
    assessment.percentage = (total_correct / len(questions)) * 100 if questions else 0
    # XP placeholder – replace with real formula later
    assessment.xp_earned = 0

    db.commit()
    db.refresh(assessment)

    resp_answers = [AnswerEntry(question_id=a.question_id, chosen_answer=a.chosen_answer) for a in assessment.answers]
    return AssessmentResponse(
        id=assessment.id,
        student_id=assessment.student_id,
        passage_id=assessment.passage_id,
        assessment_date=assessment.assessment_date,
        total_questions=assessment.total_questions,
        total_correct=assessment.total_correct,
        percentage=float(assessment.percentage),
        xp_earned=assessment.xp_earned,
        answers=resp_answers
    )

@router.get("/assessments/")
def get_assessments(
    student_id: int,
    passage_id: Optional[int] = None,
    date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ReadingAssessment).filter(ReadingAssessment.student_id == student_id)
    if passage_id:
        query = query.filter(ReadingAssessment.passage_id == passage_id)
    if date:
        query = query.filter(ReadingAssessment.assessment_date == date)
    assessments = query.order_by(ReadingAssessment.assessment_date.desc()).all()

    result = []
    for a in assessments:
        answers = [AnswerEntry(question_id=ans.question_id, chosen_answer=ans.chosen_answer) for ans in a.answers]
        result.append({
            "id": a.id,
            "student_id": a.student_id,
            "passage_id": a.passage_id,
            "assessment_date": str(a.assessment_date),
            "total_questions": a.total_questions,
            "total_correct": a.total_correct,
            "percentage": float(a.percentage),
            "xp_earned": a.xp_earned,
            "answers": answers
        })
    return result

# ========== Level Management ==========
@router.put("/students/{student_id}/level")
def update_reading_level(student_id: int, data: LevelUpdate, db: Session = Depends(get_db)):
    if data.new_level not in ALLOWED_LEVELS:
        raise HTTPException(400, f"Invalid level. Must be one of: {', '.join(ALLOWED_LEVELS)}")
    student = db.query(Student).get(student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    old_level = student.reading_level
    student.reading_level = data.new_level

    history = ReadingLevelHistory(
        student_id=student_id,
        old_level=old_level,
        new_level=data.new_level
    )
    db.add(history)
    db.commit()
    return {"message": "Level updated", "new_level": data.new_level}

@router.get("/students/{student_id}/levels")
def get_level_history(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).get(student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    history = db.query(ReadingLevelHistory).filter(
        ReadingLevelHistory.student_id == student_id
    ).order_by(ReadingLevelHistory.changed_at.desc()).all()
    return [{"old_level": h.old_level, "new_level": h.new_level, "changed_at": str(h.changed_at)} for h in history]