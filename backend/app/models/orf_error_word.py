from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class OrfErrorWord(Base):
    __tablename__ = "orf_error_words"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("orf_assessments.id", ondelete="CASCADE"))
    word_index: Mapped[int] = mapped_column(Integer)

    assessment: Mapped["OrfAssessment"] = relationship(back_populates="error_words")