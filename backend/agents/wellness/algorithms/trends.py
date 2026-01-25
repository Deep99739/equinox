# trend analysis

from datetime import date
from typing import List


def analyze_trends(logs: List[dict], days: int = 7) -> dict:
    """
    analyze health trends over specified period
    
    for each metric:
    - calculate average
    - compare first half vs second half
    - determine trend direction (up/down/stable)
    
    logs should be list of dicts with: date, readiness_score, sleep_hours, energy_level, stress_level
    """
    
    if not logs or len(logs) < 2:
        return {
            "days": 0,
            "trends": {},
            "message": "need more data for trend analysis"
        }
    
    # sort by date ascending for trend calc
    sorted_logs = sorted(logs, key=lambda x: x.get("date") or "", reverse=False)[:days]
    n = len(sorted_logs)
    
    if n < 2:
        return {
            "days": n,
            "trends": {},
            "message": "need at least 2 data points"
        }
    
    # split into first and second half
    mid = n // 2
    first_half = sorted_logs[:mid] if mid > 0 else sorted_logs[:1]
    second_half = sorted_logs[mid:]
    
    def avg(items, key):
        vals = [x.get(key) for x in items if x.get(key) is not None]
        return sum(vals) / len(vals) if vals else None
    
    def trend(first, second):
        if first is None or second is None:
            return "stable"
        diff = second - first
        if abs(diff) < 0.5:  # threshold for "stable"
            return "stable"
        return "up" if diff > 0 else "down"
    
    def arrow(t):
        return {"up": "↑", "down": "↓", "stable": "→"}.get(t, "→")
    
    metrics = ["readiness_score", "sleep_hours", "energy_level", "stress_level"]
    results = {}
    
    for m in metrics:
        first_avg = avg(first_half, m)
        second_avg = avg(second_half, m)
        overall_avg = avg(sorted_logs, m)
        
        t = trend(first_avg, second_avg)
        
        results[m] = {
            "average": round(overall_avg, 1) if overall_avg else None,
            "trend": t,
            "arrow": arrow(t),
            "first_half_avg": round(first_avg, 1) if first_avg else None,
            "second_half_avg": round(second_avg, 1) if second_avg else None
        }
    
    # overall summary
    readiness_trend = results.get("readiness_score", {}).get("trend", "stable")
    energy_trend = results.get("energy_level", {}).get("trend", "stable")
    stress_trend = results.get("stress_level", {}).get("trend", "stable")
    
    if readiness_trend == "up" and energy_trend == "up":
        message = "your wellness is improving"
    elif readiness_trend == "down" and stress_trend == "up":
        message = "you seem more stressed lately"
    elif stress_trend == "down":
        message = "stress levels are coming down"
    else:
        message = "wellness is stable"
    
    return {
        "days": n,
        "trends": results,
        "message": message
    }


def get_streak_status(logs: List[dict]) -> dict:
    """check logging streak from log dates"""
    
    if not logs:
        return {"streak": 0, "message": "start logging to build a streak"}
    
    # sort descending
    sorted_dates = sorted(
        [d["date"] for d in logs if d.get("date")],
        reverse=True
    )
    
    if not sorted_dates:
        return {"streak": 0, "message": "no logs found"}
    
    # count consecutive days from today
    today = date.today()
    streak = 0
    
    for i, d in enumerate(sorted_dates):
        if isinstance(d, str):
            d = date.fromisoformat(d)
        expected = today - date.timedelta(days=i)
        if d == expected:
            streak += 1
        else:
            break
    
    if streak >= 30:
        message = f"amazing {streak}-day streak!"
    elif streak >= 7:
        message = f"great {streak}-day streak going"
    elif streak >= 3:
        message = f"{streak} days in a row, keep it up"
    elif streak == 1:
        message = "logged today, building momentum"
    else:
        message = "no current streak"
    
    return {"streak": streak, "message": message}
