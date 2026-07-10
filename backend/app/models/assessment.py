from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, Date, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.score import Score


class AssessmentSource(str, enum.Enum):
    CLASSROOM = "classroom"
    GRADES = "grades"


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    date: Mapped[datetime.date] = mapped_column(Date)
    type: Mapped[str] = mapped_column(String(50), default="quiz")
    title: Mapped[str] = mapped_column(String(255))
    total_score: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    source: Mapped[AssessmentSource] = mapped_column(
        SQLEnum(AssessmentSource), default=AssessmentSource.GRADES
    )
    school_year: Mapped[str | None] = mapped_column(String(9), nullable=True)
    term: Mapped[int | None] = mapped_column(Integer, nullable=True)
    #learning_objectives: Mapped[str | None] = mapped_column(Text, nullable=True)
    learning_objective_id: Mapped[int | None] = mapped_column(ForeignKey("learning_objectives.id"), nullable=True)
    learning_objective: Mapped["LearningObjective | None"] = relationship(back_populates="assessments")

    scores: Mapped[list["Score"]] = relationship(back_populates="assessment")