# equinox backend

import os
from dotenv import load_dotenv

# load env vars from backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# required for local oauth testing
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

# supervisor and productivity agents
from supervisor.supervisor_agent import SupervisorAgent
from state.user_tokens import get_user_tokens
from tools.google_auth import router as google_auth_router, get_gmail_service, fetch_recent_emails

# wellness agent api routes
from api import api_router

groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise RuntimeError("GROQ_API_KEY not set - check .env file")

client = Groq(api_key=groq_api_key)

app = FastAPI(
    title="Equinox API",
    description="multi-agent wellness and productivity backend",
    version="0.1.0"
)

# cors setup - allow all for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# wellness api routes
app.include_router(api_router)

# google auth routes
app.include_router(google_auth_router)


class ChatRequest(BaseModel):
    message: str


@app.get("/ping")
def ping():
    return {"message": "hello from equinox", "status": "ok"}


@app.post("/supervisor")
def supervisor_endpoint():
    """trigger supervisor agent to get work summary"""
    user_id = "demo_user"
    tokens = get_user_tokens(user_id)
    supervisor = SupervisorAgent()
    summary = supervisor.get_work_summary(tokens)
    return {"summary": summary}


@app.post("/chat")
async def chat(req: ChatRequest):
    """general chat endpoint with email integration"""
    try:
        user_id = "demo_user"
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
        return {"reply": f"Error: {str(e)}"}
