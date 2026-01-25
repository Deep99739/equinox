# db models for the wellness app

from datetime import date, time, datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
import uuid

from sqlalchemy import (
    Column, Integer, Boolean, Text, Date, Time,
    TIMESTAMP, DECIMAL, ForeignKey, Index, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .connection import Base


class User(Base):
    """core user table - auth handled separately"""
    __tablename__ = "users"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(Text, unique=True, nullable=False, index=True)
    name = Column(Text, nullable=False)
    avatar_url = Column(Text)  # s3 url or similar
    
    # gamification stuff
    wellness_xp = Column(Integer, default=0)
    wellness_level = Column(Integer, default=1)
    
    # misc
    timezone = Column(Text, default='Asia/Kolkata')
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    last_active_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # relations
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    health_logs = relationship("HealthLog", back_populates="user")
    mood_entries = relationship("MoodEntry", back_populates="user")
    workouts = relationship("Workout", back_populates="user")
    streaks = relationship("Streak", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")


class UserProfile(Base):
    """extended user info - fitness goals, thresholds etc"""
    __tablename__ = "user_profiles"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    # basic stats
    age = Column(Integer)
    height_cm = Column(DECIMAL(5, 2))
    weight_kg = Column(DECIMAL(5, 2))
    biological_sex = Column(Text)  # for health calcs
    
    # fitness stuff
    fitness_level = Column(Text, default='beginner')  # beginner/intermediate/advanced
    fitness_goal = Column(Text, default='general_fitness')
    preferred_workout_time = Column(Text, default='flexible')  # morning/afternoon/evening/flexible
    workout_preferences = Column(JSONB, default=[])  # ['hiit', 'yoga', 'strength']
    
    # learned thresholds - updated over time
    optimal_sleep_hours = Column(DECIMAL(3, 1), default=8.0)
    optimal_bedtime = Column(Time, default=time(23, 0))
    optimal_wake_time = Column(Time, default=time(7, 0))
    energy_peak_hours = Column(JSONB, default=["09:00", "10:00", "11:00"])
    
    # prefs
    motivation_style = Column(Text, default='balanced')  # tough_love/gentle/balanced
    notification_enabled = Column(Boolean, default=True)
    daily_checkin_time = Column(Time, default=time(8, 0))
    
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class HealthLog(Base):
    """daily health check-in data - one row per user per day"""
    __tablename__ = "health_logs"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    date = Column(Date, nullable=False)
    
    # sleep
    sleep_hours = Column(DECIMAL(4, 2))
    sleep_quality = Column(Integer)  # 1-10
    bed_time = Column(Time)
    wake_time = Column(Time)
    sleep_interruptions = Column(Integer, default=0)
    
    # energy throughout the day
    energy_level = Column(Integer)  # overall 1-10
    morning_energy = Column(Integer)
    afternoon_energy = Column(Integer)
    evening_energy = Column(Integer)
    
    # mental state
    stress_level = Column(Integer)  # 1-10
    anxiety_level = Column(Integer)
    mood_score = Column(Integer)
    focus_level = Column(Integer)
    
    # activity
    activity_minutes = Column(Integer, default=0)
    steps = Column(Integer, default=0)
    workout_completed = Column(Boolean, default=False)
    workout_type = Column(Text)
    workout_intensity = Column(Text)
    
    # nutrition
    water_glasses = Column(Integer, default=0)
    caffeine_cups = Column(Integer, default=0)
    alcohol_units = Column(Integer, default=0)
    meal_quality = Column(Integer)  # 1-5
    
    # calculated by our algos
    readiness_score = Column(Integer)  # 0-100
    sleep_debt_hours = Column(DECIMAL(5, 2), default=0)
    recovery_score = Column(Integer)  # 0-100
    
    # user notes
    notes = Column(Text)
    source = Column(Text, default='manual')  # manual/fitbit/apple_health
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='uq_health_logs_user_date'),
        Index('idx_health_logs_user_date', 'user_id', 'date'),
    )

    user = relationship("User", back_populates="health_logs")


class MoodEntry(Base):
    """mood tracking - can have multiple per day"""
    __tablename__ = "mood_entries"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    
    logged_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # mood data
    mood_score = Column(Integer)  # 1-10
    emotions = Column(JSONB, default=[])  # ['happy', 'anxious', 'calm']
    energy_snapshot = Column(Integer)
    
    # context
    trigger = Column(Text)  # what caused this mood
    location = Column(Text)
    activity = Column(Text)  # what were they doing
    
    # journaling
    gratitude_note = Column(Text)
    journal_entry = Column(Text)
    
    # our sentiment analysis score
    sentiment_score = Column(DECIMAL(3, 2))  # -1.0 to 1.0
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="mood_entries")


class Workout(Base):
    """workout recommendations and tracking"""
    __tablename__ = "workouts"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    
    # when
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(Time)
    
    # what
    type = Column(Text, nullable=False)  # hiit/strength/cardio/yoga/stretching
    name = Column(Text)
    description = Column(Text)
    duration_mins = Column(Integer, nullable=False)
    intensity = Column(Text)  # low/moderate/high/recovery
    
    # exercises list
    exercises = Column(JSONB, default=[])
    
    # why we suggested this
    recommended_for_readiness = Column(Integer)
    recommendation_reasoning = Column(Text)
    
    # did they do it?
    status = Column(Text, default='scheduled')  # scheduled/completed/skipped
    completed_at = Column(TIMESTAMP(timezone=True))
    actual_duration = Column(Integer)
    actual_intensity = Column(Text)
    
    # user feedback
    difficulty_rating = Column(Integer)  # 1-5
    enjoyment_rating = Column(Integer)  # 1-5
    feedback_notes = Column(Text)
    would_do_again = Column(Boolean)
    
    xp_earned = Column(Integer, default=0)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="workouts")


class Streak(Base):
    """streak tracking for gamification"""
    __tablename__ = "streaks"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    
    type = Column(Text, nullable=False)  # daily_logging/good_sleep/workout_completed/etc
    current_count = Column(Integer, default=0)
    best_count = Column(Integer, default=0)
    
    last_updated = Column(Date)
    started_at = Column(Date)

    __table_args__ = (
        UniqueConstraint('user_id', 'type', name='uq_streaks_user_type'),
    )

    user = relationship("User", back_populates="streaks")


class Achievement(Base):
    """badges and achievements"""
    __tablename__ = "achievements"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    
    type = Column(Text, nullable=False)  # unique identifier
    name = Column(Text, nullable=False)  # display name
    description = Column(Text)
    icon = Column(Text)  # emoji or icon name
    
    earned_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    xp_awarded = Column(Integer, default=0)
    
    extra_data = Column(JSONB)  # any additional context

    __table_args__ = (
        UniqueConstraint('user_id', 'type', name='uq_achievements_user_type'),
    )

    user = relationship("User", back_populates="achievements")


class AgentSignal(Base):
    """inter-agent communication - wellness agent talks to productivity agent etc"""
    __tablename__ = "agent_signals"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    
    from_agent = Column(Text, nullable=False)  # wellness/productivity/supervisor
    to_agent = Column(Text, nullable=False)
    signal_type = Column(Text, nullable=False)  # high_fatigue/burnout_risk/etc
    priority = Column(Text, default='normal')  # low/normal/high/critical
    
    payload = Column(JSONB, nullable=False)  # signal data
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    processed = Column(Boolean, default=False)
    processed_at = Column(TIMESTAMP(timezone=True))
    response = Column(JSONB)
    
    expires_at = Column(TIMESTAMP(timezone=True))


class WellnessForecast(Base):
    """predictions for upcoming days"""
    __tablename__ = "wellness_forecasts"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    
    forecast_date = Column(Date, nullable=False)
    generated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # what we predict
    predicted_readiness = Column(Integer)
    predicted_energy_curve = Column(JSONB)  # hourly predictions
    predicted_sleep_need = Column(DECIMAL(3, 1))
    
    # what we recommend
    recommended_bedtime = Column(Time)
    recommended_workout = Column(JSONB)
    risk_factors = Column(JSONB)  # warnings
    
    # tracking accuracy
    actual_readiness = Column(Integer)  # filled in next day
    accuracy_score = Column(DECIMAL(5, 2))

    __table_args__ = (
        UniqueConstraint('user_id', 'forecast_date', name='uq_forecasts_user_date'),
    )
