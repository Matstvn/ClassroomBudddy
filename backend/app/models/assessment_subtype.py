from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class AssessmentSubtype(Base):
    __tablename__ = "assessment_subtypes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    parent_type: Mapped[str] = mapped_column(String(50), nullable=False)   # 'Written Works', etc.
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)