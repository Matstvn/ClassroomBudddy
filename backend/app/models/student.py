from sqlalchemy import String, Date, Enum as SQLEnum, Boolean, Integer
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
