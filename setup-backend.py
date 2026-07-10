#!/usr/bin/env python3
"""
Single‑shot backend setup for Teacher Classroom Companion.
Creates MySQL database + user, writes all source files,
sets up a virtual environment, installs dependencies,
and runs the first Alembic migration.
"""

import os, sys, subprocess, venv, shutil, platform, getpass, tempfile

# ---------- CONFIGURATION ----------
DB_NAME = "teacher_companion"
DB_USER = "teacher"
DB_PASSWORD = "813617"      # change this!
DB_HOST = "localhost"
DB_PORT = 3306
BACKEND_DIR = "backend"
VENV_DIR = "educ"
MYSQL_CLIENT = "mysql"               # may be "mysql.exe" on Windows
ROOT_USER = "root"                   # MySQL root user

# -----------------------------------

def run(cmd, cwd=None, check=True, input_text=None):
    """Run a command, optionally with stdin, and return CompletedProcess."""
    print(f"  -> {' '.join(cmd)}")
    proc = subprocess.run(cmd, cwd=cwd, input=input_text, text=True, capture_output=True)
    if check and proc.returncode != 0:
        print(f"  ERROR: {proc.stderr.strip()}")
        sys.exit(1)
    return proc

def setup_database():
    """Try to create DB and user using MySQL client."""
    print("\n=== Setting up MySQL database ===")
    if not shutil.which(MYSQL_CLIENT):
        print("⚠️  MySQL client not found in PATH. Please create the database manually.")
        return

    root_pw = getpass.getpass(f"Enter MySQL password for '{ROOT_USER}' (or leave empty if none): ")
    sql = f"""
CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '{DB_USER}'@'{DB_HOST}' IDENTIFIED BY '{DB_PASSWORD}';
GRANT ALL PRIVILEGES ON {DB_NAME}.* TO '{DB_USER}'@'{DB_HOST}';
FLUSH PRIVILEGES;
"""
    # Use a temporary file to avoid shell escaping issues
    with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
        f.write(sql)
        tmp_sql = f.name

    try:
        cmd = [MYSQL_CLIENT, "-u", ROOT_USER]
        if root_pw:
            cmd += [f"-p{root_pw}"]
        run(cmd + ["<", tmp_sql], check=False)   # shell redirection not working like this...
        # Better: pipe the file contents
        with open(tmp_sql) as f:
            proc = subprocess.run(cmd, stdin=f, text=True, capture_output=True)
        if proc.returncode != 0:
            print(f"  MySQL error (maybe wrong password or DB exists): {proc.stderr.strip()}")
        else:
            print("  ✅ Database and user ready.")
    finally:
        os.unlink(tmp_sql)

def create_structure():
    print("\n=== Creating directory structure ===")
    dirs = [
        "app/core", "app/models", "app/schemas", "app/api/v1/endpoints",
        "app/services", "app/utils", "tests"
    ]
    for d in dirs:
        os.makedirs(os.path.join(BACKEND_DIR, d), exist_ok=True)
    # Empty __init__.py files
    for init in [
        "app/__init__.py", "app/core/__init__.py", "app/models/__init__.py",
        "app/schemas/__init__.py", "app/api/__init__.py", "app/api/v1/__init__.py",
        "app/api/v1/endpoints/__init__.py", "app/services/__init__.py",
        "app/utils/__init__.py"
    ]:
        open(os.path.join(BACKEND_DIR, init), 'a').close()

def write_file(path, content):
    full = os.path.join(BACKEND_DIR, path)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  Created {path}")

def write_all_code():
    print("\n=== Writing source files ===")

    # config.py
    write_file("app/core/config.py", f'''from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    APP_NAME: str = "Teacher Classroom Companion"
    API_V1_PREFIX: str = "/api/v1"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
''')

    # database.py
    write_file("app/core/database.py", '''from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
''')

    # models/student.py
    write_file("app/models/student.py", '''from sqlalchemy import String, Date, Enum as SQLEnum, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date
from app.core.database import Base
import enum

class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"

class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lrn: Mapped[str | None] = mapped_column(String(12), unique=True, nullable=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    middle_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    extension: Mapped[str | None] = mapped_column(String(10), nullable=True)
    gender: Mapped[Gender] = mapped_column(SQLEnum(Gender))
    birth_date: Mapped[date] = mapped_column(Date)
    age: Mapped[int] = mapped_column(Integer)
    mother_tongue: Mapped[str | None] = mapped_column(String(50), nullable=True)
    ip: Mapped[bool] = mapped_column(Boolean, default=False)
    religion: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    father_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    mother_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    guardian_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    guardian_contact: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
''')

    # schemas/student.py
    write_file("app/schemas/student.py", '''from pydantic import BaseModel
from datetime import date
from typing import Optional
from ..models.student import Gender

class StudentBase(BaseModel):
    lrn: Optional[str] = None
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    extension: Optional[str] = None
    gender: Gender
    birth_date: date
    age: int
    mother_tongue: Optional[str] = None
    ip: bool = False
    religion: Optional[str] = None
    address: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    lrn: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    extension: Optional[str] = None
    gender: Optional[Gender] = None
    birth_date: Optional[date] = None
    age: Optional[int] = None
    mother_tongue: Optional[str] = None
    ip: Optional[bool] = None
    religion: Optional[str] = None
    address: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None
    is_active: Optional[bool] = None

class StudentResponse(StudentBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
''')

    # services/learner_service.py
    write_file("app/services/learner_service.py", '''from sqlalchemy.orm import Session
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
''')

    # utils/sf1_parser.py
    write_file("app/utils/sf1_parser.py", '''import openpyxl
from datetime import datetime
from app.schemas.student import StudentCreate
from app.models.student import Gender

def parse_sf1(file_path: str) -> list[StudentCreate]:
    wb = openpyxl.load_workbook(file_path, data_only=True)
    ws = wb.active
    students = []
    for row in ws.iter_rows(min_row=7, values_only=True):
        if not row[1]:  # skip if no last name
            continue
        def safe_str(idx):
            return str(row[idx]).strip() if row[idx] else None
        lrn = safe_str(0)
        last_name = str(row[1]).strip()
        first_name = str(row[2]).strip()
        middle_name = safe_str(3)
        extension = safe_str(4)
        gender_str = safe_str(5)
        gender = Gender.MALE if gender_str and gender_str.lower() == "male" else Gender.FEMALE
        birth_date = None
        if row[6]:
            if isinstance(row[6], datetime):
                birth_date = row[6].date()
            else:
                birth_date = datetime.strptime(str(row[6]), "%Y-%m-%d").date()
        age = int(row[7]) if row[7] else 0
        mother_tongue = safe_str(8)
        ip = safe_str(9) in ("yes", "y", "true", "1") if row[9] else False
        religion = safe_str(10)
        address = safe_str(11)
        father_name = safe_str(12)
        mother_name = safe_str(13)
        guardian_name = safe_str(14)
        guardian_contact = safe_str(15)

        students.append(StudentCreate(
            lrn=lrn,
            last_name=last_name,
            first_name=first_name,
            middle_name=middle_name,
            extension=extension,
            gender=gender,
            birth_date=birth_date,
            age=age,
            mother_tongue=mother_tongue,
            ip=ip,
            religion=religion,
            address=address,
            father_name=father_name,
            mother_name=mother_name,
            guardian_name=guardian_name,
            guardian_contact=guardian_contact,
        ))
    return students
''')

    # endpoints/learners.py
    write_file("app/api/v1/endpoints/learners.py", '''from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import tempfile, os
from app.core.database import get_db
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.services import learner_service
from app.utils.sf1_parser import parse_sf1

router = APIRouter()

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
''')

    # main.py
    write_file("app/main.py", '''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import learners

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(learners.router, prefix=f"{settings.API_V1_PREFIX}/learners", tags=["learners"])

@app.get("/health")
def health():
    return {"status": "ok"}
''')

    # requirements.txt
    write_file("requirements.txt", '''fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
alembic==1.13.2
pymysql==1.1.1
python-multipart==0.0.9
openpyxl==3.1.5
pydantic==2.9.2
pydantic-settings==2.5.2
python-dotenv==1.0.1
''')

def setup_venv_and_deps():
    print("\n=== Setting up virtual environment ===")
    venv_path = os.path.join(BACKEND_DIR, VENV_DIR)
    if not os.path.exists(venv_path):
        venv.create(venv_path, with_pip=True)
    pip = os.path.join(venv_path, "Scripts" if platform.system()=="Windows" else "bin", "pip")
    run([pip, "install", "--upgrade", "pip"])
    run([pip, "install", "-r", "requirements.txt"], cwd=BACKEND_DIR)

def setup_alembic():
    print("\n=== Setting up Alembic ===")
    venv_path = os.path.join(BACKEND_DIR, VENV_DIR)
    alembic = os.path.join(venv_path, "Scripts" if platform.system()=="Windows" else "bin", "alembic")
    if not os.path.exists(alembic):
        alembic += ".exe" if platform.system()=="Windows" else ""

    if not os.path.exists(os.path.join(BACKEND_DIR, "alembic.ini")):
        run([alembic, "init", "alembic"], cwd=BACKEND_DIR)

    # Modify env.py
    env_path = os.path.join(BACKEND_DIR, "alembic", "env.py")
    with open(env_path, "r") as f:
        env_content = f.read()
    env_content = env_content.replace(
        "target_metadata = None",
        "import sys, os\nsys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))\nfrom app.core.database import Base\nfrom app.models.student import Student\ntarget_metadata = Base.metadata"
    )
    with open(env_path, "w") as f:
        f.write(env_content)

    # Set connection in alembic.ini
    ini_path = os.path.join(BACKEND_DIR, "alembic.ini")
    with open(ini_path, "r") as f:
        ini = f.read()
    ini = ini.replace(
        "sqlalchemy.url = driver://user:pass@localhost/dbname",
        f"sqlalchemy.url = mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    with open(ini_path, "w") as f:
        f.write(ini)

    # Generate and apply migration
    run([alembic, "revision", "--autogenerate", "-m", "Initial migration"], cwd=BACKEND_DIR)
    run([alembic, "upgrade", "head"], cwd=BACKEND_DIR)

def main():
    print("==============================================")
    print(" Teacher Classroom Companion - Backend Setup")
    print("==============================================")

    setup_database()
    create_structure()
    write_all_code()
    setup_venv_and_deps()
    setup_alembic()

    print("\n✅ Backend setup complete!")
    print(f"\nTo run the server:")
    print(f"  cd {BACKEND_DIR}")
    if platform.system() == "Windows":
        print(f"  {VENV_DIR}\\Scripts\\activate")
    else:
        print(f"  source {VENV_DIR}/bin/activate")
    print("  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")

if __name__ == "__main__":
    main()