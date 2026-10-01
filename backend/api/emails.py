from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, User
from state.user_tokens import get_user_tokens
from tools.google_auth import get_gmail_service
from auth import get_current_email, require_owner

router = APIRouter(prefix="/api/emails", tags=["emails"])

@router.get("/{email}")
def get_user_emails(email: str, limit: int = 50, db: Session = Depends(get_db),
                    current_email: str = Depends(get_current_email)):
    """
    Fetch recent emails for a user.
    """
    # 1. Get User
    email = require_owner(email, current_email)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Get tokens
    tokens = get_user_tokens(email)
    if not tokens:
        raise HTTPException(status_code=401, detail="User not authenticated with Google")
        
    # 3. Get Service
    try:
        service = get_gmail_service(tokens)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Failed to create Gmail service") from e
        
    # 4. Fetch Emails
    try:
        results = service.users().messages().list(
            userId="me",
            maxResults=limit,
        ).execute()
        
        messages = results.get("messages", [])
        if not messages:
            return []

        email_details = []

        def callback(request_id, response, exception):
            if exception:
                print(f"Error fetching email {request_id}: {exception}")
            else:
                headers = response.get("payload", {}).get("headers", [])
                subject = next((h["value"] for h in headers if h["name"].lower() == "subject"), "No Subject")
                sender = next((h["value"] for h in headers if h["name"].lower() == "from"), "Unknown")
                date = next((h["value"] for h in headers if h["name"].lower() == "date"), "")
                snippet = response.get("snippet", "")
                
                email_details.append({
                    "id": response["id"],
                    "threadId": response["threadId"],
                    "subject": subject,
                    "sender": sender,
                    "date": date,
                    "snippet": snippet
                })

        batch = service.new_batch_http_request()
        for msg in messages:
            batch.add(
                service.users().messages().get(userId="me", id=msg['id'], format="metadata"), 
                callback=callback
            )
        
        batch.execute()
        
        # Sort by date optionally, but Gmail usually returns chronological? 
        # Actually batch callbacks might happen in any order. 
        # But `messages` list was chronological (newest first).
        # We should restore order or sort.
        # Parsing date string is annoying.
        # Simpler: Map by ID then reconstruct list based on original `messages` order.
        
        details_map = {item["id"]: item for item in email_details}
        ordered_emails = []
        for msg in messages:
            if msg["id"] in details_map:
                ordered_emails.append(details_map[msg["id"]])
                
        return ordered_emails

    except Exception as e:
        raise HTTPException(status_code=502, detail="Gmail API error") from e
