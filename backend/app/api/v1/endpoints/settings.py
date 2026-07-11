from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.app_settings import AppSettings
from pydantic import BaseModel
from datetime import date

router = APIRouter()

class SettingsResponse(BaseModel):
    school_year: str
    term1_start: date
    term1_end: date
    term2_start: date
    term2_end: date
    term3_start: date
    term3_end: date

class SettingsUpdate(BaseModel):
    school_year: str
    term1_start: date
    term1_end: date
    term2_start: date
    term2_end: date
    term3_start: date
    term3_end: date

@router.get("/", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(AppSettings).first()
    if not settings:
        # Create default row
        settings = AppSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/", response_model=SettingsResponse)
def update_settings(data: SettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(AppSettings).first()
    if not settings:
        settings = AppSettings(id=1, **data.model_dump())
        db.add(settings)
    else:
        for k, v in data.model_dump().items():
            setattr(settings, k, v)
    db.commit()
    db.refresh(settings)
    return settings