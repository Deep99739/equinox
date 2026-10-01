
# productivity agent tools

from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from typing import Optional, List
from datetime import datetime
import uuid

# Import database dependencies
from database import SessionLocal

# Import Services
from api.notes import (
    create_note_service, 
    get_user_notes_service, 
    delete_note_service
)
from api.todos import (
    create_todo_service, 
    get_todos_service, 
    delete_todo_service,
    update_todo_service
)

from tools import google_auth
from llm_config import GROQ_MODEL


def session_email(config: RunnableConfig) -> str:
    email = config.get("configurable", {}).get("user_email")
    if not email:
        raise ValueError("Authenticated user context is missing")
    return email


@tool
def fetch_recent_emails(config: RunnableConfig) -> dict:
    """
    Fetch recent emails from Gmail.
    Useful for summarizing work or checking for missed messages.
    """
    from state.user_tokens import get_user_tokens
    
    tokens = get_user_tokens(session_email(config))
    if not tokens:
        return {"error": "No Google tokens found. User needs to sign in."}
        
    service = google_auth.get_gmail_service(tokens)
    emails = google_auth.fetch_recent_emails(service)
    return {"recent_emails": emails}

# Notes Tools

@tool
def fetch_notes(config: RunnableConfig) -> dict:
    """
    Fetch all notes for a specific user.
    """
    session = SessionLocal()
    try:
        notes = get_user_notes_service(session, session_email(config))
        # Serialize
        notes_list = [
            {
                "id": str(n.id),
                "title": n.title,
                "content": n.content,
                "created_at": n.created_at.isoformat() if n.created_at else None
            }
            for n in notes
        ]
        return {"notes": notes_list}
    except Exception as e:
        return {"error": str(e)}
    finally:
        session.close()

@tool
def create_note(title: str, content: str, config: RunnableConfig) -> dict:
    """
    Create a new note for the user. 
    """
    session = SessionLocal()
    try:
        new_note = create_note_service(session, session_email(config), title, content, source='ai_agent')
        return {
            "status": "success", 
            "note_id": str(new_note.id), 
            "message": f"Note '{title}' created."
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        session.close()

@tool
def delete_note(note_id: str, config: RunnableConfig) -> dict:
    """
    Delete a note by its ID.
    """
    session = SessionLocal()
    try:
        # Validate UUID
        try:
            n_uuid = uuid.UUID(note_id)
        except ValueError:
            return {"error": "Invalid Note ID format."}

        success = delete_note_service(session, n_uuid, session_email(config))
        if success:
             return {"status": "success", "message": "Note deleted."}
        else:
             return {"error": "Note not found."}
    except Exception as e:
        return {"error": str(e)}
    finally:
        session.close()

# Todos Tools

@tool
def fetch_todos(config: RunnableConfig) -> dict:
    """
    Fetch all todos for a specific user.
    """
    session = SessionLocal()
    try:
        todos = get_todos_service(session, session_email(config))
        # Convert Pydantic/SQLAlchemy objects to dicts
        # If todos are SQLAlchemy models, we need manual conversion or use Pydantic models if returned as such.
        # The service returns SQLAlchemy models with .id stringified.
        todos_list = []
        for t in todos:
             todos_list.append({
                 "id": str(t.id),
                 "text": t.text,
                 "completed": t.completed,
                 "due_date": t.due_date.isoformat() if t.due_date else None,
                 "created_at": t.created_at.isoformat() if t.created_at else None
             })
        return {"todos": todos_list}
    except Exception as e:
        return {"error": str(e)}
    finally:
        session.close()

@tool
def create_todo(text: str, config: RunnableConfig, due_date: Optional[str] = None) -> dict:
    """
    Create a new todo item.
    """
    session = SessionLocal()
    try:
        parsed_date = None
        if due_date:
            try:
                parsed_date = datetime.strptime(due_date, "%Y-%m-%d").date()
            except ValueError:
                return {"error": "Invalid date format. Use YYYY-MM-DD."}

        new_todo = create_todo_service(session, session_email(config), text, parsed_date)
        return {"status": "success", "todo_id": str(new_todo.id), "message": f"Todo '{text}' created."}
    except Exception as e:
        return {"error": str(e)}
    finally:
        session.close()

@tool
def delete_todo(todo_id: str, config: RunnableConfig) -> dict:
    """
    Delete a todo by its ID.
    """
    session = SessionLocal()
    try:
        success = delete_todo_service(session, todo_id, session_email(config))
        if success:
            return {"status": "success", "message": "Todo deleted."}
        else:
            return {"error": "Todo not found."}
    except Exception as e:
        return {"error": str(e)}
    finally:
        session.close()

@tool
def update_todo(todo_id: str, config: RunnableConfig, completed: Optional[bool] = None, text: Optional[str] = None) -> dict:
    """
    Update a todo item. Can mark as complete/incomplete or update the text.
    Args:
        todo_id: The ID of the todo to update
        completed: Set to True to mark as complete, False to mark as incomplete
        text: Optional new text for the todo
    """
    from api.todos import TodoUpdate
    session = SessionLocal()
    try:
        updates = TodoUpdate(completed=completed, text=text)
        updated = update_todo_service(session, todo_id, updates, session_email(config))
        if updated:
            return {
                "status": "success", 
                "message": f"Todo updated. Completed: {updated.completed}",
                "todo": {
                    "id": str(updated.id),
                    "text": updated.text,
                    "completed": updated.completed
                }
            }
        else:
            return {"error": "Todo not found."}
    except Exception as e:
        return {"error": str(e)}
    finally:
        session.close()




# Google Tasks Tools

@tool
def get_google_tasks(config: RunnableConfig) -> dict:
    """
    Get all tasks from Google Tasks.
    Use this to see the user's task list from Google.
    """
    from state.user_tokens import get_user_tokens
    
    tokens = get_user_tokens(session_email(config))
    
    if not tokens:
        return {"error": "No Google tokens found. User needs to sign in."}
    
    try:
        service = google_auth.get_tasks_service(tokens)
        tasks = google_auth.fetch_tasks(service)
        
        formatted_tasks = [{
            "title": task.get('title', 'Untitled'),
            "status": task.get('status', 'needsAction'),
            "due": task.get('due'),
            "notes": task.get('notes', '')[:100] if task.get('notes') else None
        } for task in tasks]
        
        return {"google_tasks": formatted_tasks, "count": len(formatted_tasks)}
    except Exception as e:
        return {"error": f"Failed to fetch Google Tasks: {str(e)}"}


@tool
def create_google_task(title: str, config: RunnableConfig, notes: Optional[str] = None) -> dict:
    """
    Create a new task in Google Tasks.
    Args:
        title: The title of the task
        notes: Optional description/notes for the task
    """
    from state.user_tokens import get_user_tokens
    
    tokens = get_user_tokens(session_email(config))
    
    if not tokens:
        return {"error": "No Google tokens found. User needs to sign in."}
    
    try:
        service = google_auth.get_tasks_service(tokens)
        result = google_auth.create_task(service, title, notes)
        return {"status": "success", "task_id": result.get('id'), "message": f"Task '{title}' created in Google Tasks."}
    except Exception as e:
        return {"error": f"Failed to create Google Task: {str(e)}"}


@tool  
def get_email_summary(config: RunnableConfig) -> dict:
    """
    Get a summary of recent emails highlighting urgent items and action items.
    Use this when the user asks about their email priorities or what needs attention.
    """
    import os
    from langchain_groq import ChatGroq
    from opik.integrations.langchain import OpikTracer
    from state.user_tokens import get_user_tokens
    
    tokens = get_user_tokens(session_email(config))
    
    if not tokens:
        return {"error": "No Google tokens found. User needs to sign in."}
    
    try:
        service = google_auth.get_gmail_service(tokens)
        email_ids = google_auth.fetch_recent_emails(service, max_results=5)
        
        emails = []
        for email_meta in email_ids:
            details = google_auth.get_email_details(service, email_meta['id'])
            emails.append(details)
        
        if not emails:
            return {"summary": "No recent emails found.", "email_count": 0}
        
        email_text = "\n\n".join([
            f"From: {e['sender']}\nSubject: {e['subject']}\nDate: {e['date']}\nContent: {e['body'][:500]}"
            for e in emails
        ])
        
        llm = ChatGroq(
            model=GROQ_MODEL,
            temperature=0.3,
            api_key=os.getenv("GROQ_API_KEY")
        )
        
        prompt = f"""Summarize these emails in 2-3 sentences. Highlight:
1. Urgent items needing immediate attention
2. Action items to respond to

Emails:
{email_text}

Brief summary:"""

        response = llm.invoke(prompt, config={"callbacks": [OpikTracer(project_name="equinox")]})
        
        return {"summary": response.content, "email_count": len(emails)}
    except Exception as e:
        return {"error": f"Failed to summarize emails: {str(e)}"}


# All productivity tools list
PRODUCTIVITY_TOOLS = [
    fetch_recent_emails,
    fetch_notes,
    create_note,
    delete_note,
    fetch_todos,
    create_todo,
    update_todo,
    delete_todo,
    get_google_tasks,
    create_google_task,
    get_email_summary
]
