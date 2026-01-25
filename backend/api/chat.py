# wellness agent chat endpoint

from pydantic import BaseModel
from fastapi import APIRouter

from agents.wellness.agent import chat_with_wellness_agent

router = APIRouter(prefix="/chat", tags=["chat"])

# hardcoded test user for now
TEST_USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    user_id: str


@router.post("/wellness", response_model=ChatResponse)
def wellness_chat(req: ChatRequest):
    """chat with the wellness agent"""
    
    response = chat_with_wellness_agent(
        user_id=TEST_USER_ID,
        message=req.message
    )
    
    return ChatResponse(
        response=response,
        user_id=TEST_USER_ID
    )
