# health api endpoints

from datetime import date, datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db, HealthLog, User, UserProfile
from schemas import HealthLogCreate, HealthLogResponse, ReadinessResponse
from auth import get_current_email, require_owner

router = APIRouter(prefix="/health", tags=["health"])

def user_id_for_email(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.id


def calculate_readiness(log: HealthLog, profile: UserProfile = None) -> dict:
    """
    calculate readiness score from health data
    
    weights:
    - sleep: 35%
    - energy: 25%
    - stress: 20% (inverted)
    - activity: 10%
    - consistency: 10%
    """
    optimal_sleep = profile.optimal_sleep_hours if profile else 8.0
    
    # normalize each factor to 0-100
    sleep_factor = min(100, (float(log.sleep_hours or 0) / float(optimal_sleep)) * 100)
    sleep_quality_bonus = ((log.sleep_quality or 5) - 5) * 5  # -25 to +25
    sleep_factor = max(0, min(100, sleep_factor + sleep_quality_bonus))
    
    energy_factor = ((log.energy_level or 5) / 10) * 100
    stress_factor = ((10 - (log.stress_level or 5)) / 10) * 100  # inverted
    
    activity_target = 30  # mins
    activity_factor = min(100, ((log.activity_minutes or 0) / activity_target) * 100)
    
    # consistency - simplified for now (will improve later)
    consistency_factor = 50  # placeholder
    
    # weighted sum
    score = int(
        sleep_factor * 0.35 +
        energy_factor * 0.25 +
        stress_factor * 0.20 +
        activity_factor * 0.10 +
        consistency_factor * 0.10
    )
    score = max(0, min(100, score))
    
    # determine zone
    if score >= 80:
        zone = "peak"
    elif score >= 60:
        zone = "good"
    elif score >= 40:
        zone = "moderate"
    elif score >= 20:
        zone = "low"
    else:
        zone = "critical"
    
    return {
        "score": score,
        "zone": zone,
        "sleep_factor": int(sleep_factor),
        "energy_factor": int(energy_factor),
        "stress_factor": int(stress_factor),
        "activity_factor": int(activity_factor),
        "consistency_factor": int(consistency_factor)
    }


@router.post("/log", response_model=HealthLogResponse)
async def log_health(data: HealthLogCreate, db: Session = Depends(get_db),
                     current_email: str = Depends(get_current_email)):
    """log or update health data for a date"""
    
    if data.user_email:
        require_owner(data.user_email, current_email)
    user_id = user_id_for_email(db, current_email)
            
    log_date = data.date or date.today()
    
    # check if exists
    existing = db.query(HealthLog).filter(
        HealthLog.user_id == user_id,
        HealthLog.date == log_date
    ).first()
    
    is_new_log = existing is None
    
    if existing:
        # update
        for key, value in data.model_dump(exclude_unset=True, exclude={"date", "user_email"}).items():
            setattr(existing, key, value)
        log = existing
    else:
        # create
        log = HealthLog(
            user_id=user_id,
            date=log_date,
            **data.model_dump(exclude={"date", "user_email"})
        )
        db.add(log)
    
    # calculate readiness
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    readiness = calculate_readiness(log, profile)
    log.readiness_score = readiness["score"]
    
    db.commit()
    db.refresh(log)
    
    # Trigger auto-email briefing if this is today's first log
    if is_new_log and log_date == date.today():
        try:
            from api.briefing import send_briefing_email_internal
            # Get user email from the User table
            user = db.query(User).filter(User.id == user_id).first()
            if user and user.email:
                # Send briefing email in background (fire and forget)
                import asyncio
                asyncio.create_task(send_briefing_email_internal(user.email))
        except Exception as e:
            # Don't fail the health log if email fails
            print(f"Auto-email failed: {e}")
    
    return log


@router.get("/today", response_model=HealthLogResponse)
def get_today(user_email: Optional[str] = None, db: Session = Depends(get_db),
              current_email: str = Depends(get_current_email)):
    """get today's health log"""
    
    if user_email:
        require_owner(user_email, current_email)
    user_id = user_id_for_email(db, current_email)
            
    today = date.today()
    
    log = db.query(HealthLog).filter(
        HealthLog.user_id == user_id,
        HealthLog.date == today
    ).first()
    
    if not log:
        raise HTTPException(status_code=404, detail="no log for today yet")
    
    return log


@router.get("/history")
def get_history(days: int = Query(7, ge=1, le=365), user_email: Optional[str] = None,
                db: Session = Depends(get_db), current_email: str = Depends(get_current_email)):
    """get health history for last N days"""
    
    if user_email:
        require_owner(user_email, current_email)
    user_id = user_id_for_email(db, current_email)
            
    logs = db.query(HealthLog).filter(
        HealthLog.user_id == user_id,
        HealthLog.date >= date.today() - timedelta(days=days - 1),
        HealthLog.date <= date.today(),
    ).order_by(HealthLog.date.desc()).limit(days).all()
    
    return [HealthLogResponse.model_validate(log) for log in logs]


@router.get("/readiness", response_model=ReadinessResponse)
def get_readiness(user_email: Optional[str] = None, db: Session = Depends(get_db),
                  current_email: str = Depends(get_current_email)):
    """get current readiness score with breakdown"""
    
    if user_email:
        require_owner(user_email, current_email)
    user_id = user_id_for_email(db, current_email)
            
    today = date.today()
    
    log = db.query(HealthLog).filter(
        HealthLog.user_id == user_id,
        HealthLog.date == today
    ).first()
    
    if not log:
        raise HTTPException(status_code=404, detail="log today's health first")
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    result = calculate_readiness(log, profile)
    
    # add suggestions based on zone
    zone = result["zone"]
    if zone == "peak":
        summary = "you're at peak performance today"
        suggestions = ["great day for challenging workouts", "tackle your hardest tasks"]
    elif zone == "good":
        summary = "solid day ahead"
        suggestions = ["normal activities are fine", "stay hydrated"]
    elif zone == "moderate":
        summary = "take it a bit easier today"
        suggestions = ["lighter workout recommended", "prioritize important tasks only"]
    elif zone == "low":
        summary = "focus on recovery"
        suggestions = ["skip intense exercise", "get to bed early tonight"]
    else:
        summary = "rest day needed"
        suggestions = ["avoid strenuous activity", "prioritize sleep and nutrition"]
    
    return ReadinessResponse(
        **result,
        summary=summary,
        suggestions=suggestions
    )
