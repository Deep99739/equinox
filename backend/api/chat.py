# agent chat endpoints

from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_email
from api.health import user_id_for_email

from agents.wellness.agent import chat_with_wellness_agent
# Note: productivity agent import moved to function level to avoid circular import

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    user_id: str


@router.post("/wellness", response_model=ChatResponse)
def wellness_chat(req: ChatRequest, db: Session = Depends(get_db),
                  current_email: str = Depends(get_current_email)):
    """Chat with the wellness agent"""
    
    user_id = str(user_id_for_email(db, current_email))
    response = chat_with_wellness_agent(
        user_id=user_id,
        message=req.message
    )
    
    return ChatResponse(
        response=response,
        user_id=user_id
    )


@router.post("/productivity", response_model=ChatResponse)
def productivity_chat(req: ChatRequest, current_email: str = Depends(get_current_email)):
    """Chat with the productivity agent - handles emails, tasks, scheduling"""
    # Lazy import to avoid circular dependency
    from agents.productivity.agent import chat_with_productivity_agent
    
    response = chat_with_productivity_agent(
        user_id=current_email,
        message=req.message
    )
    
    return ChatResponse(
        response=response,
        user_id=current_email
    )

