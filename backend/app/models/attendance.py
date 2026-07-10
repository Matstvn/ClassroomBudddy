from sqlalchemy import Date, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
import enum
from app.core.database import Base

class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"

class SessionEnum(str, enum.Enum):
    AM = "AM"
    PM = "PM"

class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    date: Mapped[datetime.date] = mapped_column(Date)
    status: Mapped[AttendanceStatus] = mapped_column(SQLEnum(AttendanceStatus), default=AttendanceStatus.PRESENT)
    session: Mapped[SessionEnum] = mapped_column(SQLEnum(SessionEnum), default=SessionEnum.AM)

    __table_args__ = (UniqueConstraint("student_id", "date", "session", name="uq_attendance_session"),)