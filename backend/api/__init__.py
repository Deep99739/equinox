# api router setup

from fastapi import APIRouter

from .health import router as health_router
from .profile import router as profile_router
from .chat import router as chat_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(profile_router)
api_router.include_router(chat_router)
