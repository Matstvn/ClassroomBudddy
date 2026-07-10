from sqlalchemy import String, Integer, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from app.core.database import Base

class OrfAssessment(Base):
    __tablename__ = "orf_assessments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    passage_id: Mapped[int] = mapped_column(ForeignKey("reading_passages.id"))
    assessment_date: Mapped[date] = mapped_column(Date)
    time_seconds: Mapped[int] = mapped_column(Integer)
    total_words: Mapped[int] = mapped_column(Integer)
    error_count: Mapped[int] = mapped_column(Integer, default=0)
    wcpm: Mapped[float] = mapped_column(DECIMAL(6,2), default=0.0)
    accuracy: Mapped[float] = mapped_column(DECIMAL(5,2), default=0.0)

    # Relationships
    passage: Mapped["ReadingPassage"] = relationship()
    error_words: Mapped[list["OrfErrorWord"]] = relationship(back_populates="assessment")