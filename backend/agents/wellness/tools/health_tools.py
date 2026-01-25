# wellness agent tools

from datetime import date
from uuid import UUID
from langchain_core.tools import tool

from database import SessionLocal, HealthLog, UserProfile

# hardcoded for now - will get from auth later
TEST_USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"


def get_db_session():
    return SessionLocal()


@tool
def get_health_today() -> dict:
    """get today's health data. returns empty dict if not logged yet."""
    
    user_id = UUID(TEST_USER_ID)
    db = get_db_session()
    try:
        log = db.query(HealthLog).filter(
            HealthLog.user_id == user_id,
            HealthLog.date == date.today()
        ).first()
        
        if not log:
            return {"logged": False, "message": "no health data logged today"}
        
        return {
            "logged": True,
            "date": str(log.date),
            "sleep_hours": float(log.sleep_hours) if log.sleep_hours else None,
            "sleep_quality": log.sleep_quality,
            "energy_level": log.energy_level,
            "stress_level": log.stress_level,
            "mood_score": log.mood_score,
            "activity_minutes": log.activity_minutes,
            "readiness_score": log.readiness_score
        }
    finally:
        db.close()


@tool
def get_readiness_score() -> dict:
    """get today's readiness score with zone and suggestions"""
    
    from agents.wellness.algorithms import calculate_readiness, get_zone_recommendations
    
    user_id = UUID(TEST_USER_ID)
    db = get_db_session()
    try:
        log = db.query(HealthLog).filter(
            HealthLog.user_id == user_id,
            HealthLog.date == date.today()
        ).first()
        
        if not log:
            return {"error": "no health data logged today", "score": None}
        
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        optimal = float(profile.optimal_sleep_hours) if profile else 8.0
        
        result = calculate_readiness(
            sleep_hours=float(log.sleep_hours or 0),
            sleep_quality=log.sleep_quality or 5,
            energy_level=log.energy_level or 5,
            stress_level=log.stress_level or 5,
            activity_minutes=log.activity_minutes or 0,
            optimal_sleep=optimal
        )
        
        recs = get_zone_recommendations(result["zone"])
        
        return {
            "score": result["score"],
            "zone": result["zone"],
            "factors": result["factors"],
            "summary": recs["summary"],
            "suggestions": recs["suggestions"]
        }
    finally:
        db.close()


@tool
def get_sleep_debt_info() -> dict:
    """calculate sleep debt from last 14 days of data"""
    
    from agents.wellness.algorithms import calculate_sleep_debt, get_sleep_recommendations
    
    user_id = UUID(TEST_USER_ID)
    db = get_db_session()
    try:
        logs = db.query(HealthLog).filter(
            HealthLog.user_id == user_id
        ).order_by(HealthLog.date.desc()).limit(14).all()
        
        if not logs:
            return {"debt_hours": 0, "message": "no sleep data available"}
        
        sleep_history = [
            {"date": str(log.date), "sleep_hours": float(log.sleep_hours or 0)}
            for log in logs
        ]
        
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        optimal = float(profile.optimal_sleep_hours) if profile else 8.0
        
        result = calculate_sleep_debt(sleep_history, optimal_sleep=optimal)
        tips = get_sleep_recommendations(result["debt_hours"])
        
        return {**result, "tips": tips}
    finally:
        db.close()


@tool
def get_wellness_trends(days: int = 7) -> dict:
    """analyze wellness trends over last N days (default 7)"""
    
    from agents.wellness.algorithms import analyze_trends
    
    user_id = UUID(TEST_USER_ID)
    db = get_db_session()
    try:
        logs = db.query(HealthLog).filter(
            HealthLog.user_id == user_id
        ).order_by(HealthLog.date.desc()).limit(days).all()
        
        if len(logs) < 2:
            return {"message": "need more data for trends"}
        
        log_dicts = [
            {
                "date": str(log.date),
                "readiness_score": log.readiness_score,
                "sleep_hours": float(log.sleep_hours) if log.sleep_hours else None,
                "energy_level": log.energy_level,
                "stress_level": log.stress_level
            }
            for log in logs
        ]
        
        return analyze_trends(log_dicts, days)
    finally:
        db.close()


@tool
def suggest_activity(readiness_zone: str) -> dict:
    """suggest activities based on readiness zone (peak/good/moderate/low/critical)"""
    
    suggestions = {
        "peak": {
            "workout": "high intensity - HIIT, running, heavy lifting",
            "work": "tackle your hardest tasks",
            "mindset": "push yourself today"
        },
        "good": {
            "workout": "moderate - strength training, cycling, swimming",
            "work": "productive day for focused work",
            "mindset": "steady progress"
        },
        "moderate": {
            "workout": "light - yoga, walking, stretching",
            "work": "prioritize essential tasks only",
            "mindset": "conserve energy"
        },
        "low": {
            "workout": "recovery only - gentle stretching, walking",
            "work": "handle only urgent matters",
            "mindset": "focus on rest"
        },
        "critical": {
            "workout": "rest - no exercise today",
            "work": "consider taking time off",
            "mindset": "recovery is the priority"
        }
    }
    
    return suggestions.get(readiness_zone, suggestions["moderate"])


WELLNESS_TOOLS = [
    get_health_today,
    get_readiness_score,
    get_sleep_debt_info,
    get_wellness_trends,
    suggest_activity
]
