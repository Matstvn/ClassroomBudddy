from sqlalchemy import String, Text, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class ReadingPassage(Base):
    __tablename__ = "reading_passages"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text)
    level: Mapped[str] = mapped_column(String(50))         # one of the 8 level names
    passage_type: Mapped[str] = mapped_column(String(20), default="comprehension")  # "comprehension", "orf", "phil_iri"
    created_at: Mapped[str] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    questions: Mapped[list["ReadingQuestion"]] = relationship(back_populates="passage")