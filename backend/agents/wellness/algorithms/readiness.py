# readiness score algorithm

from decimal import Decimal


def calculate_readiness(
    sleep_hours: float,
    sleep_quality: int,
    energy_level: int,
    stress_level: int,
    activity_minutes: int = 0,
    optimal_sleep: float = 8.0,
    streak_days: int = 0
) -> dict:
    """
    calculate readiness score (0-100) from health metrics
    
    weights:
    - sleep: 35% (hours + quality)
    - energy: 25%
    - stress: 20% (inverted - low stress = high score)
    - activity: 10%
    - consistency: 10% (based on streak)
    
    returns dict with score, zone, and factor breakdown
    """
    
    # SLEEP FACTOR (35%)
    # base: how close to optimal hours
    sleep_ratio = min(1.0, sleep_hours / optimal_sleep)
    sleep_base = sleep_ratio * 100
    
    # quality bonus: -25 to +25 based on 1-10 rating
    quality_bonus = (sleep_quality - 5) * 5
    
    sleep_factor = max(0, min(100, sleep_base + quality_bonus))
    
    # ENERGY FACTOR (25%)
    energy_factor = (energy_level / 10) * 100
    
    # STRESS FACTOR (20%) - inverted
    # high stress (10) = 0 score, low stress (1) = 100 score
    stress_factor = ((10 - stress_level) / 9) * 100
    
    # ACTIVITY FACTOR (10%)
    # target: 30 mins is 100%
    activity_target = 30
    activity_factor = min(100, (activity_minutes / activity_target) * 100)
    
    # CONSISTENCY FACTOR (10%)
    # based on logging streak
    if streak_days >= 30:
        consistency_factor = 100
    elif streak_days >= 14:
        consistency_factor = 80
    elif streak_days >= 7:
        consistency_factor = 60
    elif streak_days >= 3:
        consistency_factor = 40
    else:
        consistency_factor = 20
    
    # WEIGHTED SUM
    score = int(
        sleep_factor * 0.35 +
        energy_factor * 0.25 +
        stress_factor * 0.20 +
        activity_factor * 0.10 +
        consistency_factor * 0.10
    )
    score = max(0, min(100, score))
    
    # DETERMINE ZONE
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
        "factors": {
            "sleep": int(sleep_factor),
            "energy": int(energy_factor),
            "stress": int(stress_factor),
            "activity": int(activity_factor),
            "consistency": int(consistency_factor)
        }
    }


def get_zone_recommendations(zone: str) -> dict:
    """get summary and suggestions for a readiness zone"""
    
    zones = {
        "peak": {
            "summary": "you're at peak performance today",
            "suggestions": [
                "great day for challenging workouts",
                "tackle your hardest tasks",
                "push your limits if you want"
            ]
        },
        "good": {
            "summary": "solid day ahead",
            "suggestions": [
                "normal activities are fine",
                "stay hydrated",
                "maintain your routine"
            ]
        },
        "moderate": {
            "summary": "take it a bit easier today",
            "suggestions": [
                "lighter workout recommended",
                "prioritize important tasks only",
                "consider an early night"
            ]
        },
        "low": {
            "summary": "focus on recovery today",
            "suggestions": [
                "skip intense exercise",
                "get to bed early tonight",
                "take breaks often"
            ]
        },
        "critical": {
            "summary": "rest day needed",
            "suggestions": [
                "avoid strenuous activity",
                "prioritize sleep and nutrition",
                "consider taking a day off if possible"
            ]
        }
    }
    
    return zones.get(zone, zones["moderate"])
