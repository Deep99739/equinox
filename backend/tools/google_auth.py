import os
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from state.user_tokens import save_user_tokens

router = APIRouter()

# use client_secret.json from the same directory as this file
client_secret_path = os.path.join(os.path.dirname(__file__), "client_secret.json")
print("Using client_secret_path:", client_secret_path)

@router.get("/auth/google/login")
def google_login():
    flow = Flow.from_client_secrets_file(
        client_secret_path,
        scopes=[
            "https://www.googleapis.com/auth/gmail.readonly",
        ],
        redirect_uri="http://localhost:8000/auth/google/callback"
    )
    auth_url, _ = flow.authorization_url(
        prompt="consent",
        access_type="offline"
    )
    return {"auth_url": auth_url}

@router.get("/auth/google/callback")
def google_callback(request: Request):
    flow = Flow.from_client_secrets_file(
        client_secret_path,
        scopes=[
            "https://www.googleapis.com/auth/gmail.readonly",
        ],
        redirect_uri="http://localhost:8000/auth/google/callback"
    )
    flow.fetch_token(authorization_response=str(request.url))
    credentials = flow.credentials

    # STORE THESE SECURELY
    tokens = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes
    }
    # For demo, use a fixed user_id (replace with real user identification in production)
    user_id = "demo_user"
    save_user_tokens(user_id, tokens)

    # Redirect to frontend chat page after successful sign-in
    return RedirectResponse("http://localhost:5173/chat")

def get_gmail_service(tokens):
    creds = Credentials(**tokens)
    return build("gmail", "v1", credentials=creds)

def fetch_recent_emails(service):
    results = service.users().messages().list(
        userId="me",
        maxResults=5
    ).execute()

    return results.get("messages", [])
