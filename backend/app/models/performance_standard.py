from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class PerformanceStandard(Base):
    __tablename__ = "performance_standards"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    description: Mapped[str] = mapped_column(Text)
    content_standard_id: Mapped[int | None] = mapped_column(ForeignKey("content_standards.id"), nullable=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    term: Mapped[int] = mapped_column(Integer)
    school_year: Mapped[str] = mapped_column(String(9))

    # relationships
    competencies: Mapped[list["LearningCompetency"]] = relationship(back_populates="performance_standard")