from sqlalchemy.orm import Session
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate

def get_students(db: Session, active_only: bool = True):
    query = db.query(Student)
    if active_only:
        query = query.filter(Student.is_active == True)
    return query.all()

def get_student(db: Session, student_id: int):
    return db.query(Student).filter(Student.id == student_id).first()

def create_student(db: Session, student: StudentCreate):
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, student_id: int, student: StudentUpdate):
    db_student = get_student(db, student_id)
    if not db_student:
        return None
    for key, value in student.model_dump(exclude_unset=True).items():
        setattr(db_student, key, value)
    db.commit()
    db.refresh(db_student)
    return db_student

def archive_student(db: Session, student_id: int):
    db_student = get_student(db, student_id)
    if db_student:
        db_student.is_active = False
        db.commit()
        return True
    return False

def import_from_sf1(db: Session, students: list[StudentCreate]):
    count = 0
    for s in students:
        db.add(Student(**s.model_dump()))
        count += 1
    db.commit()
    return count

def delete_student(db: Session, student_id: int):
    db_student = get_student(db, student_id)
    if db_student:
        db.delete(db_student)
        db.commit()
        return True
    return False