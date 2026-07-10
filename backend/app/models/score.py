from sqlalchemy import Integer, ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Score(Base):
    __tablename__ = "scores"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id"))
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    score: Mapped[float] = mapped_column(Float, default=0.0)

    # Forward references to Assessment and Student – no imports needed
    assessment: Mapped["Assessment"] = relationship(back_populates="scores")
    student: Mapped["Student"] = relationship()

    __table_args__ = (
        UniqueConstraint("assessment_id", "student_id", name="uq_score"),
    )