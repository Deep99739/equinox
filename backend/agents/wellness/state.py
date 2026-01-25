# wellness agent state

from typing import TypedDict, Annotated, Sequence, Optional, Any
from langchain_core.messages import BaseMessage
import operator


class WellnessState(TypedDict):
    """state for the wellness agent graph"""
    
    # conversation
    messages: Annotated[Sequence[BaseMessage], operator.add]
    
    # user context
    user_id: str
    timezone: str
    
    # today's data
    today_health: Optional[dict]
    readiness_score: Optional[int]
    readiness_zone: Optional[str]
    
    # analysis
    sleep_debt: Optional[float]
    weekly_trend: Optional[dict]
    
    # output control
    response: Optional[str]
