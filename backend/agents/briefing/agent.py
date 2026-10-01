"""
Morning Briefing Agent
Orchestrates wellness and productivity data to generate daily briefing
"""

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from llm_config import GROQ_MODEL


async def generate_briefing(user_email: str) -> dict:
    """
    Generate morning briefing combining health + productivity data
    
    Args:
        user_email: User's email address
        
    Returns:
        dict with greeting, today's sleep score, recent unread emails, open tasks, and summary
    """
    user_email = user_email.lower()
    
    # 1. Get health data
    sleep_score = None
    try:
        from database.operations import get_today_health_log
        health_log = get_today_health_log(user_email)
        
        if health_log:
            # Calculate sleep score (0-100 based on hours)
            sleep_hours = health_log.get("sleep_hours", 0)
            sleep_score = min(int(sleep_hours * 12), 100)  # 8h = 96 points
    except Exception as e:
        print(f"Health data fetch error: {e}")
    
    # 2. Get Tasks & Emails
    open_tasks = 0
    schedule_updated = False
    task_titles = []
    unread_emails = 0
    email_summaries = []
    
    # Get tokens ONCE for both services
    try:
        from state.user_tokens import get_user_tokens
        tokens = get_user_tokens(user_email)
    except Exception as e:
        print(f"Token fetch error: {e}")
        tokens = None

    # TASKS
    try:
        # Use the unified service that gets Local + Google tasks
        from api.todos import get_todos_service
        from database.connection import SessionLocal
        
        db = SessionLocal()
        try:
            # This returns List[TodoResponse]
            all_todos = get_todos_service(db, user_email)
            
            # Filter for incomplete
            incomplete_todos = [t for t in all_todos if not t.completed]
            open_tasks = len(incomplete_todos)
            schedule_updated = open_tasks > 0
            task_titles = [t.text for t in incomplete_todos]
        finally:
            db.close()
        
    except Exception as e:
        print(f"Tasks fetch error: {e}")

    # EMAILS
    if tokens:
        try:
            from tools.google_auth import get_gmail_service, fetch_recent_emails
            
            service = get_gmail_service(tokens)
            # Fetch specifically unread emails
            emails = fetch_recent_emails(service, max_results=10, query='is:unread')
            unread_emails = len(emails)
            
            # Gmail's list response only contains IDs. Fetch metadata for context.
            for e in emails[:5]:
                message = service.users().messages().get(
                    userId='me', id=e['id'], format='metadata',
                    metadataHeaders=['Subject'],
                ).execute()
                subject = next((
                    h.get('value', '') for h in message.get('payload', {}).get('headers', [])
                    if h.get('name', '').lower() == 'subject'
                ), '')
                context = f"{subject}: {message.get('snippet', '')}".strip(': ')
                if context:
                    email_summaries.append(f"- {context[:200]}")
                
        except Exception as e:
            print(f"Email fetch error: {e}")

    # 4. Generate AI summary
    summary = ""
    try:
        llm = ChatGroq(
            model=GROQ_MODEL,
            api_key=os.getenv("GROQ_API_KEY"),
            temperature=0.7
        )
        
        prompt = ChatPromptTemplate.from_template(
            """You are a helpful AI assistant creating a brief morning summary.
            
            User's data:
            - Today's sleep score: {sleep_score} (if not logged, say no data was logged today)
            - Recent unread emails sampled (up to 10): {emails}
            - Recent Email Snippets: {email_context}
            - Open Tasks Count: {tasks}
            - Task List: {task_list}
            
            Generate a warm, encouraging morning briefing (max 3 sentences).
            1. Acknowledge their health status if today's sleep score is available. Otherwise suggest tracking sleep.
            2. Mention their workload (tasks). Mention specific high-priority sounding tasks if any.
            3. Mention if checking emails is urgent based on snippets.
            
            Keep it friendly, concise, and actionable.
            """
        )
        
        chain = prompt | llm
        response = chain.invoke({
            "sleep_score": sleep_score if sleep_score is not None else "not logged",
            "emails": unread_emails,
            "email_context": "; ".join(email_summaries) if email_summaries else "No recent emails",
            "tasks": open_tasks,
            "task_list": ", ".join(task_titles[:5]) # Pass first 5 task titles
        })
        
        summary = response.content
    except Exception as e:
        print(f"LLM summary error: {e}")
        summary = "AI summary is unavailable right now. Please try refreshing later."
    
    # Extract user name from email
    user_name = user_email.split('@')[0].title()
    
    return {
        "greeting": f"Good morning, {user_name}",
        "sleep_score": sleep_score,
        "unread_emails": unread_emails,
        "critical_emails": unread_emails,  # Compatibility with an older deployed frontend.
        "schedule_updated": schedule_updated,
        "tasks_count": open_tasks,
        "summary": summary
    }
