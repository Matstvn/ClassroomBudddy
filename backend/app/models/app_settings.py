from sqlalchemy import String, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date
from app.core.database import Base

class AppSettings(Base):
    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    school_year: Mapped[str] = mapped_column(String(9), default="2026-2027")
    term1_start: Mapped[date] = mapped_column(Date, default=date(2026,8,1))
    term1_end: Mapped[date] = mapped_column(Date, default=date(2026,10,31))
    term2_start: Mapped[date] = mapped_column(Date, default=date(2026,11,1))
    term2_end: Mapped[date] = mapped_column(Date, default=date(2027,1,31))
    term3_start: Mapped[date] = mapped_column(Date, default=date(2027,2,1))
    term3_end: Mapped[date] = mapped_column(Date, default=date(2027,5,31))