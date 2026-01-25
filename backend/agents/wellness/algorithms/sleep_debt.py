# sleep debt calculation

from datetime import date, timedelta
from typing import List


def calculate_sleep_debt(
    sleep_history: List[dict],  # list of {date, sleep_hours}
    optimal_sleep: float = 8.0,
    lookback_days: int = 14
) -> dict:
    """
    calculate accumulated sleep debt over the lookback period
    
    rules:
    - if slept less than optimal: adds to debt
    - if slept more than optimal: can recover up to 1hr/day max
    - total debt capped at 40 hours (5 days worth)
    
    returns debt in hours and estimated recovery days
    """
    
    if not sleep_history:
        return {
            "debt_hours": 0.0,
            "days_analyzed": 0,
            "recovery_days": 0,
            "status": "unknown",
            "message": "no sleep data available"
        }
    
    # sort by date descending, take recent days
    sorted_history = sorted(sleep_history, key=lambda x: x["date"], reverse=True)
    recent = sorted_history[:lookback_days]
    
    debt = 0.0
    for day in recent:
        diff = optimal_sleep - day["sleep_hours"]
        if diff > 0:
            # under-slept: add to debt
            debt += diff
        else:
            # over-slept: recover max 1hr
            debt -= min(1.0, abs(diff))
    
    # cap debt
    debt = max(0, min(40, debt))
    
    # estimate recovery (recover ~1hr extra sleep per night)
    recovery_days = int(debt) if debt > 0 else 0
    
    # status
    if debt == 0:
        status = "rested"
        message = "you're well rested"
    elif debt < 5:
        status = "mild"
        message = f"slight sleep debt ({debt:.1f}h) - easy to recover"
    elif debt < 15:
        status = "moderate"
        message = f"noticeable debt ({debt:.1f}h) - prioritize sleep this week"
    elif debt < 25:
        status = "significant"
        message = f"significant debt ({debt:.1f}h) - recovery will take ~{recovery_days} days"
    else:
        status = "severe"
        message = f"severe debt ({debt:.1f}h) - consider consulting a doctor if fatigued"
    
    return {
        "debt_hours": round(debt, 1),
        "days_analyzed": len(recent),
        "recovery_days": recovery_days,
        "status": status,
        "message": message
    }


def get_sleep_recommendations(debt_hours: float) -> List[str]:
    """get tips based on sleep debt level"""
    
    base = ["maintain consistent bed/wake times"]
    
    if debt_hours == 0:
        return base + ["you're doing great, keep it up"]
    elif debt_hours < 5:
        return base + [
            "add 30min extra sleep tonight",
            "avoid screens before bed"
        ]
    elif debt_hours < 15:
        return base + [
            "aim for 8-9 hours tonight",
            "skip caffeine after 2pm",
            "consider a 20min power nap"
        ]
    else:
        return base + [
            "prioritize sleep over other activities",
            "keep room dark and cool",
            "no alcohol - it disrupts sleep quality",
            "consider going to bed 1 hour earlier"
        ]
