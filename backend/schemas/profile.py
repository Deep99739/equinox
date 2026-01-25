# pydantic schemas for user profile

from datetime import time
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class UserProfileCreate(BaseModel):
    """initial profile setup"""
    
    # basic stats
    age: Optional[int] = Field(None, gt=0, lt=150)
    height_cm: Optional[float] = Field(None, gt=0, lt=300)
    weight_kg: Optional[float] = Field(None, gt=0, lt=500)
    biological_sex: Optional[str] = None
    
    # fitness
    fitness_level: str = Field("beginner")  # beginner/intermediate/advanced
    fitness_goal: str = Field("general_fitness")
    preferred_workout_time: str = Field("flexible")  # morning/afternoon/evening/flexible
    
    # preferences
    motivation_style: str = Field("balanced")  # tough_love/gentle/balanced
    optimal_sleep_hours: float = Field(8.0, ge=4, le=12)


class UserProfileUpdate(BaseModel):
    """update profile - all fields optional"""
    
    age: Optional[int] = Field(None, gt=0, lt=150)
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    biological_sex: Optional[str] = None
    
    fitness_level: Optional[str] = None
    fitness_goal: Optional[str] = None
    preferred_workout_time: Optional[str] = None
    
    motivation_style: Optional[str] = None
    optimal_sleep_hours: Optional[float] = None
    optimal_bedtime: Optional[time] = None
    optimal_wake_time: Optional[time] = None
    
    notification_enabled: Optional[bool] = None
    daily_checkin_time: Optional[time] = None


class UserProfileResponse(BaseModel):
    """profile response"""
    
    id: UUID
    user_id: UUID
    
    age: Optional[int]
    height_cm: Optional[float]
    weight_kg: Optional[float]
    biological_sex: Optional[str]
    
    fitness_level: str
    fitness_goal: str
    preferred_workout_time: str
    workout_preferences: list
    
    optimal_sleep_hours: float
    optimal_bedtime: Optional[time]
    optimal_wake_time: Optional[time]
    energy_peak_hours: list
    
    motivation_style: str
    notification_enabled: bool
    daily_checkin_time: Optional[time]
    
    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    """basic user info"""
    
    id: UUID
    email: str
    name: str
    avatar_url: Optional[str]
    
    wellness_xp: int
    wellness_level: int
    timezone: str
    
    class Config:
        from_attributes = True
