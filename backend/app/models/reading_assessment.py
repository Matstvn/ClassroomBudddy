from sqlalchemy import String, Integer, Date, ForeignKey, DECIMAL, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from app.core.database import Base

class ReadingAssessment(Base):
    __tablename__ = "reading_assessments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    passage_id: Mapped[int] = mapped_column(ForeignKey("reading_passages.id"))
    assessment_date: Mapped[date] = mapped_column(Date)
    total_questions: Mapped[int] = mapped_column(Integer)
    total_correct: Mapped[int] = mapped_column(Integer, default=0)
    percentage: Mapped[float] = mapped_column(DECIMAL(5,2), default=0.0)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)

    answers: Mapped[list["ReadingAssessmentAnswer"]] = relationship(back_populates="assessment")

    __table_args__ = (
        UniqueConstraint("student_id", "passage_id", "assessment_date", name="uq_reading_assessment"),
    )