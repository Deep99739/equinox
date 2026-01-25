# pydantic schemas for health endpoints

from datetime import date, time
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class HealthLogCreate(BaseModel):
    """input for logging health data"""
    
    # date - defaults to today if not provided
    date: Optional[date] = None
    
    # sleep (required)
    sleep_hours: float = Field(..., ge=0, le=24)
    sleep_quality: int = Field(..., ge=1, le=10)
    bed_time: Optional[time] = None
    wake_time: Optional[time] = None
    
    # energy & mental (required)
    energy_level: int = Field(..., ge=1, le=10)
    stress_level: int = Field(..., ge=1, le=10)
    mood_score: int = Field(..., ge=1, le=10)
    
    # optional extras
    morning_energy: Optional[int] = Field(None, ge=1, le=10)
    afternoon_energy: Optional[int] = Field(None, ge=1, le=10)
    evening_energy: Optional[int] = Field(None, ge=1, le=10)
    focus_level: Optional[int] = Field(None, ge=1, le=10)
    anxiety_level: Optional[int] = Field(None, ge=1, le=10)
    
    # activity
    activity_minutes: Optional[int] = Field(0, ge=0)
    steps: Optional[int] = Field(0, ge=0)
    workout_completed: Optional[bool] = False
    workout_type: Optional[str] = None
    
    # nutrition
    water_glasses: Optional[int] = Field(0, ge=0)
    caffeine_cups: Optional[int] = Field(0, ge=0)
    alcohol_units: Optional[int] = Field(0, ge=0)
    meal_quality: Optional[int] = Field(None, ge=1, le=5)
    
    notes: Optional[str] = None


class HealthLogResponse(BaseModel):
    """output when retrieving health data"""
    
    id: UUID
    user_id: UUID
    date: date
    
    # sleep
    sleep_hours: Optional[float]
    sleep_quality: Optional[int]
    bed_time: Optional[time]
    wake_time: Optional[time]
    
    # energy
    energy_level: Optional[int]
    morning_energy: Optional[int]
    afternoon_energy: Optional[int]
    evening_energy: Optional[int]
    
    # mental
    stress_level: Optional[int]
    anxiety_level: Optional[int]
    mood_score: Optional[int]
    focus_level: Optional[int]
    
    # activity
    activity_minutes: int
    steps: int
    workout_completed: bool
    workout_type: Optional[str]
    
    # nutrition
    water_glasses: int
    caffeine_cups: int
    alcohol_units: int
    meal_quality: Optional[int]
    
    # calculated
    readiness_score: Optional[int]
    sleep_debt_hours: Optional[float]
    recovery_score: Optional[int]
    
    notes: Optional[str]
    source: str
    
    class Config:
        from_attributes = True


class ReadinessResponse(BaseModel):
    """readiness score with breakdown"""
    
    score: int = Field(..., ge=0, le=100)
    zone: str  # peak/good/moderate/low/critical
    
    # breakdown (0-100 each)
    sleep_factor: int
    energy_factor: int
    stress_factor: int
    activity_factor: int
    consistency_factor: int
    
    # recommendations
    summary: str
    suggestions: list[str]


class TrendItem(BaseModel):
    date: date
    readiness: Optional[int]
    sleep_hours: Optional[float]
    energy: Optional[int]
    stress: Optional[int]


class TrendResponse(BaseModel):
    """weekly/monthly trends"""
    
    days: int
    data: list[TrendItem]
    
    # averages
    avg_readiness: Optional[float]
    avg_sleep: Optional[float]
    avg_energy: Optional[float]
    avg_stress: Optional[float]
    
    # trends (up/down/stable)
    readiness_trend: str
    sleep_trend: str
    energy_trend: str
    stress_trend: str
