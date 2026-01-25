import os
from dotenv import load_dotenv

# Always load .env from the backend directory (works if run from backend/)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from supervisor.supervisor_agent import SupervisorAgent
from agents.productivity_agent import ProductivityAgent
from agents.health_agent import HealthAgent

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise RuntimeError(
        "GROQ_API_KEY environment variable is not set. "
        "Please configure it before starting the application."
    )
client = Groq(api_key=groq_api_key)


# Initialize agents and supervisor
productivity_agent = ProductivityAgent()
sub_agents = {
    'productivity': productivity_agent
}
supervisor_agent = SupervisorAgent(sub_agents=sub_agents)
health_agent = HealthAgent(supervisor=supervisor_agent)

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

# Demo endpoint to simulate the scenario:
class FatigueRequest(BaseModel):
    fatigue_level: int

@app.post("/simulate-fatigue")
def simulate_fatigue(req: FatigueRequest):
    """
    Simulate Health Agent detecting high fatigue and Supervisor instructing Productivity Agent.
    """
    health_agent.detect_fatigue(req.fatigue_level)
    return {"status": "Simulation complete. Check backend logs for actions taken."}

@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": req.message}]
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        return {"reply": f"Error: {str(e)}"}



