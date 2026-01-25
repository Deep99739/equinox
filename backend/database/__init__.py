# database module exports
# sqlalchemy models + pinecone vector store

from .connection import Base, engine, SessionLocal, get_db, test_connection
from .models import (
    User,
    UserProfile,
    HealthLog,
    MoodEntry,
    Workout,
    Streak,
    Achievement,
    AgentSignal,
    WellnessForecast
)
from .pinecone_db import (
    get_pinecone_index,
    store_memory,
    search_memories,
    delete_memory,
    delete_user_memories,
    test_pinecone_connection,
    MEMORY_TYPES
)

__all__ = [
    # sqlalchemy
    "Base",
    "engine",
    "SessionLocal",
    "get_db",
    "test_connection",
    # models
    "User",
    "UserProfile",
    "HealthLog",
    "MoodEntry",
    "Workout",
    "Streak",
    "Achievement",
    "AgentSignal",
    "WellnessForecast",
    # pinecone
    "get_pinecone_index",
    "store_memory",
    "search_memories",
    "delete_memory",
    "delete_user_memories",
    "test_pinecone_connection",
    "MEMORY_TYPES"
]
