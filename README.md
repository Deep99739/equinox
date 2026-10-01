# Equinox

A calmer place for your tasks, notes, wellbeing check-ins, and AI assistance.

[Open the live app](https://equinox0.netlify.app)

![The Equinox Today workspace with sample tasks](frontend/public/equinox-today-preview.png)

## What you can do

- **Start with Today:** see open tasks, a wellness check-in prompt, and a path to your briefing or chat.
- **Manage tasks and notes:** add, complete, edit, and keep track of the small things that matter.
- **Check in on yourself:** manually log sleep, energy, stress, and mood; view readiness feedback when available.
- **Ask Equinox:** use general or wellness chat for help thinking through your day.
- **Generate a briefing:** request a summary of tasks, wellness, and connected email, then choose whether to send it by email.

Equinox uses Google sign-in. The interface does not require a wellness entry to reach your tasks or chat. Briefings are generated when you request them.

[Design decisions](DESIGN.md) explain the new information structure, visual language, and motion choices.

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python API |
| **LangChain + LangGraph** | Multi-agent orchestration |
| **Groq (Llama 3.3 70B)** | Fast LLM inference |
| **PostgreSQL** | Persistent data storage |
| **Opik** | LLM observability & tracing |
| **Google OAuth 2.0** | Gmail & Tasks integration |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19 + TypeScript** | Modern UI framework |
| **Vite** | Fast build tooling |
| **React Router** | Client-side navigation |
| **React Markdown (GFM)** | Rich chat rendering |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database
- API Keys:
  - [Groq API](https://console.groq.com/keys)
  - [Opik API](https://www.comet.com/opik)
  - [Google OAuth Credentials](https://console.cloud.google.com/)

### One-Command Startup

```bash
# Clone the repository
git clone https://github.com/Deep99739/equinox.git
cd equinox

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
# Set SESSION_SECRET to a long random value (for example, python -c "import secrets; print(secrets.token_urlsafe(48))")
# Set FRONTEND_URL and GOOGLE_REDIRECT_URI to the URLs of your frontend and OAuth callback
# Initialize the PostgreSQL schema with the same URL used in backend/.env:
psql 'postgresql://user:pass@localhost:5432/equinox' -f backend/database/init.sql

# Run everything
chmod +x startup.sh
./startup.sh
```

### Environment Variables

Create `backend/.env`:

```env
# Required
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
DATABASE_URL=postgresql://user:pass@localhost:5432/equinox
SESSION_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Opik Observability (Required for tracing)
OPIK_API_KEY=your_opik_api_key
OPIK_WORKSPACE=your_opik_workspace
OPIK_PROJECT_NAME=equinox

# Google OAuth (for Gmail & Tasks)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Optional: only needed for semantic memory features
PINECONE_API_KEY=your_pinecone_api_key
```

For the frontend, copy `frontend/.env.example` to `frontend/.env` and set
`VITE_API_URL` to the backend's public base URL when deploying. Configure
`FRONTEND_URL` on the backend to that frontend's exact origin. Google OAuth
must use `GOOGLE_REDIRECT_URI` as an authorized callback URL. Existing users
will need to sign in again after enabling session cookies.

`GROQ_MODEL` defaults to `openai/gpt-oss-120b` when omitted. Groq retired
`llama-3.3-70b-versatile` for free and developer accounts in August 2026;
remove any old `GROQ_MODEL` override from Render when deploying this update.

---

## 📁 Project Structure

```
equinox/
├── backend/
│   ├── agents/
│   │   ├── briefing/        # Morning briefing agent
│   │   ├── productivity/    # Email, notes, todos agent
│   │   └── wellness/        # Health and fitness agent
│   ├── supervisor/          # Query router (LangGraph)
│   ├── api/                 # REST endpoints
│   │   ├── briefing.py      # Briefing generation
│   │   ├── todos.py         # Task management
│   │   ├── notes.py         # Note-taking
│   │   └── google_oauth.py  # OAuth flow
│   ├── database/            # SQLAlchemy models
│   ├── state/               # User token management
│   ├── tools/               # Google API utilities
│   └── main.py              # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Today/       # Daily workspace
│   │   │   ├── Home/        # Landing page
│   │   │   ├── Chat/        # Agentic chatbot
│   │   │   ├── Briefing/    # Morning briefing
│   │   │   ├── Productivity/ # Notes and tasks
│   │   │   └── Wellness/    # Health dashboard
│   │   ├── components/      # Shared UI components
│   │   └── api/             # API client utilities
│   └── package.json
└── startup.sh               # Development startup script
```

---

## 🔌 API Endpoints

### Core
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ping` | Health check |
| `POST` | `/supervisor` | Send message to AI supervisor |

### Briefing
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/briefing/generate` | Generate morning briefing |
| `POST` | `/api/briefing/send-email` | Email briefing to user |

### Todos
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/todos/{email}` | Get user todos (Local + Google Tasks) |
| `POST` | `/todos/` | Create todo |
| `PUT` | `/todos/{id}` | Toggle/update todo |
| `DELETE` | `/todos/{id}` | Delete todo |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notes/{email}` | Get user notes |
| `POST` | `/notes/` | Create note |
| `PATCH` | `/notes/{id}` | Update note |
| `DELETE` | `/notes/{id}` | Delete note |

### Chat History
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/history/{email}` | Get all conversation threads |
| `GET` | `/api/history/{email}/{thread_id}` | Get specific thread |
| `POST` | `/api/history/{email}/{thread_id}` | Save thread |

---

## 📊 Opik Integration

Equinox uses **Opik** for complete LLM observability:

### What's Traced
- ✅ All LangChain agent invocations
- ✅ Tool calls (Gmail, Tasks, Notes)
- ✅ LLM prompts and responses
- ✅ Latency and token usage
- ✅ Conversation threading

### Viewing Traces
1. Go to [comet.com/opik](https://www.comet.com/opik)
2. Navigate to the `equinox` project
3. View traces grouped by `thread_id`

### Why Opik?
- **Debug AI issues** — See exactly what the LLM received and responded
- **Optimize costs** — Monitor token usage across agents
- **Improve quality** — Analyze agent decisions and tool usage

---

## 🧪 Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `OPIK_API_KEY not found` | Set in `backend/.env` |
| Google OAuth errors | Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` |
| Rate limiting (429) | Groq free tier: 30 req/min. Wait or upgrade. |
| Database connection errors | Verify `DATABASE_URL` and PostgreSQL is running |
| Briefing shows 0 emails/tasks | Re-authenticate with Google OAuth |

---

## 👨‍💻 Author

**Deepak Kumar**

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**🌅 Equinox — Balance your day with AI**

*Built with ❤️ for the Opik Hackathon*

</div>
