from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import tempfile, os
from app.core.database import get_db
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.services import learner_service
from app.utils.sf1_parser import parse_sf1

router = APIRouter()

@router.delete("/{student_id}/permanent")
def permanently_delete_learner(student_id: int, db: Session = Depends(get_db)):
    if not learner_service.delete_student(db, student_id):
        raise HTTPException(status_code=404, detail="Learner not found")
    return {"message": "Learner permanently deleted"}

@router.get("/", response_model=list[StudentResponse])
def list_learners(active_only: bool = True, db: Session = Depends(get_db)):
    return learner_service.get_students(db, active_only)

@router.get("/{student_id}", response_model=StudentResponse)
def get_learner(student_id: int, db: Session = Depends(get_db)):
    student = learner_service.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Learner not found")
    return student

@router.post("/", response_model=StudentResponse, status_code=201)
def add_learner(student: StudentCreate, db: Session = Depends(get_db)):
    return learner_service.create_student(db, student)

@router.put("/{student_id}", response_model=StudentResponse)
def edit_learner(student_id: int, student: StudentUpdate, db: Session = Depends(get_db)):
    updated = learner_service.update_student(db, student_id, student)
    if not updated:
        raise HTTPException(404, detail="Learner not found")
    return updated

@router.delete("/{student_id}")
def archive_learner(student_id: int, db: Session = Depends(get_db)):
    if not learner_service.archive_student(db, student_id):
        raise HTTPException(404, detail="Learner not found")
    return {"message": "Learner archived"}

@router.post("/import/sf1")
async def import_sf1(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(400, "Only Excel files allowed")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    try:
        students = parse_sf1(tmp_path)
        count = learner_service.import_from_sf1(db, students)
        return {"imported": count}
    finally:
        os.unlink(tmp_path)
