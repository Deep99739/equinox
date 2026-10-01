
import sys
import os
import asyncio
from dotenv import load_dotenv

# Setup paths
sys.path.append(os.getcwd())
load_dotenv()

from agents.briefing.agent import generate_briefing

async def test():
    print("Testing Briefing Generation...")
    email = "deepak997398@gmail.com"
    
    try:
        result = await generate_briefing(email)
        print("\n=== BRIEFING RESULT ===")
        print(f"Greeting: {result.get('greeting')}")
        print(f"Sleep Score: {result.get('sleep_score')}")
        print(f"Recent Unread Emails: {result.get('unread_emails')}")
        print(f"Tasks Count: {result.get('tasks_count')}")
        print(f"Schedule Updated: {result.get('schedule_updated')}")
        print(f"Summary: {result.get('summary')}")
        print("=======================")
        
        if result.get('tasks_count') > 0 or result.get('unread_emails') > 0:
             print("\nSUCCESS: Data retrieved!")
        else:
             print("\nWARNING: Counts are 0. (Might be valid if no data, but check debug output)")

    except Exception as e:
        print(f"\nCRASHED: {e}")
        import traceback
        traceback.print_exc()

    # Extra Debug for Todos
    print("\n=== DEBUGGING GET_TODOS_SERVICE ===")
    try:
        from database import SessionLocal
        from api.todos import get_todos_service
        db = SessionLocal()
        todos = get_todos_service(db, email)
        print(f"Total Todos Returned: {len(todos)}")
        for t in todos:
            print(f" - {t.text} [Completed: {t.completed}] [Source: {'Google' if not t.id.isdigit() and '-' not in t.id else 'Local/UUID'}]") 
            # Note: Checking ID format is a weak heuristic, but Google IDs are usually short alphanumeric
    except Exception as e:
        print(f"Todos Service Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
