from sqlalchemy import Integer, String, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class GradeWeight(Base):
    __tablename__ = "grade_weights"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject_id: Mapped[int | None] = mapped_column(Integer, nullable=True)  # NULL = global default
    ww_weight: Mapped[float] = mapped_column(DECIMAL(5,4), default=0.30)
    pt_weight: Mapped[float] = mapped_column(DECIMAL(5,4), default=0.50)
    te_weight: Mapped[float] = mapped_column(DECIMAL(5,4), default=0.20)