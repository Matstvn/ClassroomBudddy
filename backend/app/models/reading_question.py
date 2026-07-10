from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class ReadingQuestion(Base):
    __tablename__ = "reading_questions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    passage_id: Mapped[int] = mapped_column(ForeignKey("reading_passages.id", ondelete="CASCADE"))
    question_text: Mapped[str] = mapped_column(Text)
    option_a: Mapped[str] = mapped_column(String(255))
    option_b: Mapped[str] = mapped_column(String(255))
    option_c: Mapped[str] = mapped_column(String(255))
    option_d: Mapped[str] = mapped_column(String(255))
    correct_answer: Mapped[str] = mapped_column(String(1))   # 'A','B','C','D'

    passage: Mapped["ReadingPassage"] = relationship(back_populates="questions")