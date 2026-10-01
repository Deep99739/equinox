# equinox backend

import os
from dotenv import load_dotenv

# load env vars from backend directory
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from auth import get_current_email
from database import get_db
from api.health import user_id_for_email
from sqlalchemy.orm import Session
from pydantic import BaseModel
from opik.integrations.langchain import OpikTracer

from state.user_tokens import get_user_tokens
from tools.google_auth import router as google_auth_router, get_gmail_service, fetch_recent_emails

# wellness agent api routes
from api import api_router
from api.profile import router as profile_router

from api.notes import router as notes_router
from api.todos import router as todos_router



session_secret = os.getenv("SESSION_SECRET")
if not session_secret or len(session_secret) < 32 or session_secret == "replace_with_a_long_random_secret":
    raise RuntimeError("SESSION_SECRET must be a unique random value of at least 32 characters")

app = FastAPI(
    title="Equinox API",
    description="multi-agent wellness and productivity backend",
    version="0.1.0"
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret,
    https_only=frontend_url.startswith("https://"),
    same_site="none" if frontend_url.startswith("https://") else "lax",
)

# CORS and Origin checks must use the same allowlist for cookie-authenticated writes.
allowed_origins = [frontend_url]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def reject_cross_origin_writes(request, call_next):
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        origin = request.headers.get("origin")
        if (origin and origin not in allowed_origins) or (
            not origin and request.headers.get("sec-fetch-site") == "cross-site"
        ):
            return JSONResponse({"detail": "Origin not allowed"}, status_code=403)
    return await call_next(request)


# wellness api routes
app.include_router(api_router)

# profile api routes (top-level, not under /api)
app.include_router(profile_router)

# google auth routes
app.include_router(google_auth_router)


app.include_router(notes_router)
app.include_router(todos_router)

from api.history import router as history_router
app.include_router(history_router)

from api.emails import router as emails_router
app.include_router(emails_router)

from api.briefing import router as briefing_router
app.include_router(briefing_router)


class ChatRequest(BaseModel):
    message: str
    email: str | None = None
    thread_id: str | None = None


@app.get("/ping")
def ping():
    return {"message": "hello from equinox", "status": "ok"}


@app.post("/supervisor")
def supervisor_endpoint(req: ChatRequest, current_email: str = Depends(get_current_email),
                        db: Session = Depends(get_db)):
    """trigger supervisor agent to get work summary or handle request"""
    # Note: Using ChatRequest which has 'message' field
    user_id = current_email
    if req.email and req.email.lower() != current_email:
        raise HTTPException(status_code=403, detail="Account does not match session")
    
    from supervisor.supervisor_agent import get_supervisor_graph
    from langchain_core.messages import HumanMessage
    
    import uuid
    thread_id = req.thread_id if req.thread_id else str(uuid.uuid4())
    
    initial_state = {
        "messages": [HumanMessage(content=req.message)],
        "user_id": user_id,
        "next": None
    }
    
    try:
        user_uuid = str(user_id_for_email(db, current_email))
        supervisor = get_supervisor_graph()
        # Pass thread_id in metadata for Opik
        result = supervisor.invoke(initial_state, config={
            "callbacks": [OpikTracer(project_name="equinox")],
            "metadata": {"thread_id": thread_id},
            "configurable": {"user_id": user_uuid}
        })
        last_message = result["messages"][-1]
        return {"reply": last_message.content, "thread_id": thread_id}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=502, detail="Supervisor request failed") from e


@app.post("/chat")
async def chat(req: ChatRequest, current_email: str = Depends(get_current_email)):
    """general chat endpoint with email integration"""
    try:
        user_id = current_email
        tokens = get_user_tokens(user_id)
        
        if tokens:
            service = get_gmail_service(tokens)
            emails = fetch_recent_emails(service)
            if emails:
                email_id = emails[0]["id"]
                email = service.users().messages().get(
                    userId="me", id=email_id, format="metadata"
                ).execute()
                
                subject = None
                for header in email.get("payload", {}).get("headers", []):
                    if header["name"].lower() == "subject":
                        subject = header["value"]
                        break
                
                snippet = email.get("snippet", "")
                reply = f"Most recent email: {subject or 'No Subject'} | {snippet}"
            else:
                reply = "No recent emails found."
        else:
            reply = "No email tokens found. Please sign in with Google."
        
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=502, detail="Chat request failed") from e
    
