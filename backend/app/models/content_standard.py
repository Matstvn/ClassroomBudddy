from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class ContentStandard(Base):
    __tablename__ = "content_standards"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    description: Mapped[str] = mapped_column(Text)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    term: Mapped[int] = mapped_column(Integer)
    school_year: Mapped[str] = mapped_column(String(9))