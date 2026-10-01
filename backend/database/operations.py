from datetime import date

from sqlalchemy.orm import Session
from database import get_db, HealthLog, User
from database.connection import SessionLocal

def get_today_health_log(user_email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return None
        
        log = db.query(HealthLog).filter(
            HealthLog.user_id == user.id,
            HealthLog.date == date.today(),
        ).first()
        if not log:
            return None
            
        return {
            "sleep_hours": log.sleep_hours,
            "readiness_score": log.readiness_score,
            "energy_level": log.energy_level,
            "stress_level": log.stress_level
        }
    finally:
        db.close()
