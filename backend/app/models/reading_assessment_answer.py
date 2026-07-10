from sqlalchemy import Integer, ForeignKey, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class ReadingAssessmentAnswer(Base):
    __tablename__ = "reading_assessment_answers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("reading_assessments.id", ondelete="CASCADE"))
    question_id: Mapped[int] = mapped_column(ForeignKey("reading_questions.id"))
    chosen_answer: Mapped[str] = mapped_column(String(1))     # original letter
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)

    assessment: Mapped["ReadingAssessment"] = relationship(back_populates="answers")