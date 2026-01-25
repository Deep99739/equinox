import os
from dotenv import load_dotenv

# Always load .env from the backend directory (works if run from backend/)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Ensure OAUTHLIB_INSECURE_TRANSPORT is set for local OAuth testing
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from supervisor.supervisor_agent import SupervisorAgent
from state.user_tokens import get_user_tokens
from tools.google_auth import router as google_auth_router, get_gmail_service, fetch_recent_emails

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise RuntimeError(
        "GROQ_API_KEY environment variable is not set. "
        "Please configure it before starting the application."
    )
client = Groq(api_key=groq_api_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# Endpoint to simulate supervisor to be used in the future if needed else delete 
@app.post("/supervisor")
def simulate_fatigue():
    user_id = "demo_user"  # Replace with real user identification
    tokens = get_user_tokens(user_id)
    supervisor = SupervisorAgent()
    summary = supervisor.get_work_summary(tokens)
    return {"summary": summary}   


@app.post("/chat")
async def chat(req: ChatRequest):
    try:

        # response = client.chat.completions.create(
        #     model="llama-3.3-70b-versatile",
        #     messages=[{"role": "user", "content": req.message}]
        # )
        # llm_reply = response.choices[0].message.content

        # Fetch most recent email for demo_user
        user_id = "demo_user"
        tokens = get_user_tokens(user_id)
        if tokens:
            service = get_gmail_service(tokens)
            emails = fetch_recent_emails(service)
            if emails:
                # Get the most recent email's ID
                email_id = emails[0]["id"]
                # Fetch the email details
                email = service.users().messages().get(userId="me", id=email_id, format="metadata").execute()
                subject = None
                for header in email.get("payload", {}).get("headers", []):
                    if header["name"].lower() == "subject":
                        subject = header["value"]
                        break
                snippet = email.get("snippet", "")
                email_info = f"\nMost recent email: Subject: {subject or 'No Subject'} | Snippet: {snippet}"
            else:
                email_info = "\nNo recent emails found."
        else:
            email_info = "\nNo email tokens found. Please sign in with Google."

        return {"reply": email_info}
    except Exception as e:
        return {"reply": f"Error: {str(e)}"}

app.include_router(google_auth_router)



