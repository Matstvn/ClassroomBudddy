from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class LearningCompetency(Base):
    __tablename__ = "learning_competencies"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    description: Mapped[str] = mapped_column(Text)
    performance_standard_id: Mapped[int] = mapped_column(ForeignKey("performance_standards.id"))

    performance_standard: Mapped["PerformanceStandard"] = relationship(back_populates="competencies")
    objectives: Mapped[list["LearningObjective"]] = relationship(back_populates="competency")