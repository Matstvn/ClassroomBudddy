from sqlalchemy import Integer, String, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class ReadingLevelHistory(Base):
    __tablename__ = "reading_level_history"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    old_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    new_level: Mapped[str] = mapped_column(String(50))
    changed_at: Mapped[str] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())