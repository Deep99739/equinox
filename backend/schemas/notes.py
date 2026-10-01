# schemas/notes.py
# Pydantic schemas for notes endpoints

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class NoteCreate(BaseModel):
    """Input for creating a note"""
    user_email: str
    title: str = Field(default='', max_length=500)
    content: str = Field(default='')
    source: str = Field(default='user')


class NoteUpdate(BaseModel):
    """Input for updating a note"""
    title: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None


class NoteResponse(BaseModel):
    """Output when retrieving a note"""
    id: UUID
    user_email: str
    title: str
    content: str
    source: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
