"""
Morning Briefing API Endpoints
"""

import base64
from html import escape
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException, Depends
from auth import get_current_email, require_owner
from pydantic import BaseModel
from agents.briefing import generate_briefing
from state.user_tokens import get_user_tokens
from tools.google_auth import get_gmail_service

router = APIRouter()


class BriefingRequest(BaseModel):
    email: str


@router.post("/api/briefing/generate")
async def get_morning_briefing(req: BriefingRequest,
                               current_email: str = Depends(get_current_email)):
    """
    Generate morning briefing for user
    
    Combines:
    - Health/wellness data (sleep score)
    - Critical emails count
    - Tasks for today
    - AI-generated summary
    """
    briefing = await generate_briefing(require_owner(req.email, current_email))
    return briefing


@router.post("/api/briefing/send-email")
async def send_briefing_email(req: BriefingRequest,
                              current_email: str = Depends(get_current_email)):
    """
    Generate briefing and send it to user's email
    """
    # Get user tokens
    email = require_owner(req.email, current_email)
    tokens = get_user_tokens(email)
    if not tokens:
        raise HTTPException(status_code=401, detail="Not authenticated with Google")
    
    # Generate briefing
    briefing = await generate_briefing(email)
    
    # Create email content
    greeting = escape(str(briefing["greeting"]))
    summary = escape(str(briefing["summary"]))
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; padding: 20px; }}
            .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
            .greeting {{ font-size: 24px; font-weight: 600; margin-bottom: 24px; color: #1d1d1f; }}
            .item {{ background: #f5f5f7; padding: 16px; border-radius: 12px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }}
            .icon {{ font-size: 24px; }}
            .text {{ font-size: 16px; color: #1d1d1f; }}
            .summary {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-top: 20px; }}
            .footer {{ text-align: center; margin-top: 24px; color: #86868b; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="greeting">{greeting} 🌅</div>
            
            <div class="item">
                <span class="icon">🌙</span>
                <span class="text">Sleep Score: {briefing['sleep_score']}</span>
            </div>
            
            <div class="item">
                <span class="icon">📧</span>
                <span class="text">{briefing['critical_emails']} Critical Emails</span>
            </div>
            
            <div class="item">
                <span class="icon">✅</span>
                <span class="text">{briefing['tasks_count']} Tasks Today</span>
            </div>
            
            <div class="summary">
                <p style="margin: 0;">{summary}</p>
            </div>
            
            <div class="footer">
                Powered by <strong>Equinox</strong> - Your AI Chief of Staff
            </div>
        </div>
    </body>
    </html>
    """
    
    # Create email message
    message = MIMEMultipart('alternative')
    message['to'] = email
    message['subject'] = f"🌅 Your Morning Briefing - {briefing['greeting']}"
    
    # Attach HTML content
    html_part = MIMEText(html_content, 'html')
    message.attach(html_part)
    
    # Encode message
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
    
    try:
        # Send email via Gmail API
        service = get_gmail_service(tokens)
        service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        return {
            "success": True,
            "message": f"Briefing sent to {email}"
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail="Failed to send briefing email") from e


async def send_briefing_email_internal(email: str) -> bool:
    """
    Internal function to send briefing email (called from health log endpoint).
    Returns True on success, False on failure.
    """
    tokens = get_user_tokens(email)
    if not tokens:
        print(f"No tokens for {email}, skipping briefing email")
        return False
    
    try:
        # Generate briefing
        briefing = await generate_briefing(email)
        
        # Create email content
        greeting = escape(str(briefing["greeting"]))
        summary = escape(str(briefing["summary"]))
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; padding: 20px; }}
                .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
                .greeting {{ font-size: 24px; font-weight: 600; margin-bottom: 24px; color: #1d1d1f; }}
                .item {{ background: #f5f5f7; padding: 16px; border-radius: 12px; margin-bottom: 12px; }}
                .summary {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 24px; color: #86868b; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="greeting">{greeting} 🌅</div>
                <div class="item">🌙 Sleep Score: {briefing['sleep_score']}</div>
                <div class="item">📧 {briefing['critical_emails']} Critical Emails</div>
                <div class="item">✅ {briefing['tasks_count']} Tasks Today</div>
                <div class="summary"><p style="margin: 0;">{summary}</p></div>
                <div class="footer">Powered by <strong>Equinox</strong> - Your AI Chief of Staff</div>
            </div>
        </body>
        </html>
        """
        
        message = MIMEMultipart('alternative')
        message['to'] = email
        message['subject'] = f"🌅 Your Morning Briefing - {briefing['greeting']}"
        
        html_part = MIMEText(html_content, 'html')
        message.attach(html_part)
        
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        service = get_gmail_service(tokens)
        service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        print(f"✅ Briefing email sent to {email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send briefing email: {e}")
        return False
