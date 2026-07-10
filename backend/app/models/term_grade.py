from sqlalchemy import Integer, String, DECIMAL, ForeignKey, TIMESTAMP, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class TermGrade(Base):
    __tablename__ = "term_grades"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    school_year: Mapped[str] = mapped_column(String(9), nullable=False)
    term: Mapped[int] = mapped_column(Integer, nullable=False)
    ww_average: Mapped[float] = mapped_column(DECIMAL(5,2), default=0)
    pt_average: Mapped[float] = mapped_column(DECIMAL(5,2), default=0)
    te_score: Mapped[float] = mapped_column(DECIMAL(5,2), default=0)
    final_grade: Mapped[float] = mapped_column(DECIMAL(5,2), default=0)
    computed_at: Mapped[str] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    __table_args__ = (
        UniqueConstraint("student_id", "subject_id", "school_year", "term", name="uq_term_grade"),
    )