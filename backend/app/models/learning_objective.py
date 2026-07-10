from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class LearningObjective(Base):
    __tablename__ = "learning_objectives"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    description: Mapped[str] = mapped_column(Text)
    learning_competency_id: Mapped[int] = mapped_column(ForeignKey("learning_competencies.id"))

    # relationships
    competency: Mapped["LearningCompetency"] = relationship(back_populates="objectives")
    assessments: Mapped[list["Assessment"]] = relationship(back_populates="learning_objective")