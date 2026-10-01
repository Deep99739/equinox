# routers/notes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from database import get_db
from database.models import Note
from schemas.notes import NoteCreate, NoteUpdate, NoteResponse
from auth import get_current_email, require_owner

router = APIRouter(prefix="/notes", tags=["notes"])



# Service Functions (for Agent Use)
def create_note_service(db: Session, user_email: str, title: str, content: str, source: str = "user"):
    note = Note(
        user_email=user_email,
        title=title,
        content=content,
        source=source
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def get_user_notes_service(db: Session, user_email: str):
    return db.query(Note)\
        .filter(Note.user_email == user_email)\
        .order_by(Note.created_at.desc())\
        .all()

def get_note_service(db: Session, note_id: UUID, user_email: str):
    return db.query(Note).filter(Note.id == note_id, Note.user_email == user_email).first()

def update_note_service(db: Session, note_id: UUID, user_email: str,
                        title: str | None = None, content: str | None = None):
    note = get_note_service(db, note_id, user_email)
    if not note:
        return None
    
    if title is not None:
        note.title = title
    if content is not None:
        note.content = content
    
    db.commit()
    db.refresh(note)
    return note

def delete_note_service(db: Session, note_id: UUID, user_email: str):
    note = get_note_service(db, note_id, user_email)
    if not note:
        return False
    
    db.delete(note)
    db.commit()
    return True

# Route Handlers
@router.post("/", response_model=NoteResponse, status_code=201)
def create_note(note_data: NoteCreate, db: Session = Depends(get_db),
                current_email: str = Depends(get_current_email)):
    """Create a new note"""
    return create_note_service(
        db, 
        require_owner(note_data.user_email, current_email),
        note_data.title, 
        note_data.content, 
        note_data.source
    )


@router.get("/{user_email}", response_model=List[NoteResponse])
def get_user_notes(user_email: str, db: Session = Depends(get_db),
                   current_email: str = Depends(get_current_email)):
    """Get all notes for a user, ordered by most recent first"""
    return get_user_notes_service(db, require_owner(user_email, current_email))


@router.get("/note/{note_id}", response_model=NoteResponse)
def get_note(note_id: UUID, db: Session = Depends(get_db),
             current_email: str = Depends(get_current_email)):
    """Get a specific note by ID"""
    note = get_note_service(db, note_id, current_email)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(note_id: UUID, update_data: NoteUpdate, db: Session = Depends(get_db),
                current_email: str = Depends(get_current_email)):
    """Update a note's title and/or content"""
    note = update_note_service(db, note_id, current_email, update_data.title, update_data.content)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: UUID, db: Session = Depends(get_db),
                current_email: str = Depends(get_current_email)):
    """Delete a note"""
    success = delete_note_service(db, note_id, current_email)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return None
