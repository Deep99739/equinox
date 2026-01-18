# Equinox - AI Chat Application

A full-stack chat application with AI-powered responses using Groq's free LLM API.

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Groq API key (get free at https://console.groq.com/keys)

### One-command startup

```bash
# from repo root
echo 'GROQ_API_KEY=your_groq_api_key_here' > backend/.env
chmod +x startup.sh
./startup.sh
```

The script installs backend/frontend dependencies and starts both servers (backend on 8000, frontend on 5173). Press Ctrl+C to stop.

### Manual setup (optional)

#### 1. Setup Backend

```bash
cd backend

# Install dependencies
pip3 install -r requirements.txt

# Create .env file with your Groq API key
echo 'GROQ_API_KEY=your_groq_api_key_here' > .env

# Start backend server (runs on http://localhost:8000)
python3 -m uvicorn main:app --reload
```

#### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev
```

### Access the Application

- **Chat App**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

## Project Structure

```
equinox/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── .env            # API keys (not in git)
└── frontend/
    ├── src/
    │   ├── pages/Chat/ChatPage.tsx   # Chat interface
    │   ├── App.tsx                   # Main app
    │   └── main.tsx                  # Entry point
    ├── package.json    # Node dependencies
    └── vite.config.ts  # Vite configuration
```

## Features

- Real-time AI chat with Groq's Llama 3.3 70B model
- FastAPI backend with automatic API documentation
- React + TypeScript frontend
- CORS enabled for local development
- Error handling and graceful fallbacks

## Environment Variables

Create a `.env` file in the backend folder:

```env
GROQ_API_KEY=your_api_key_here
```

⚠️ **Never commit the `.env` file** - it's in `.gitignore`

## Development

### Backend Commands
```bash
# Start with auto-reload
python3 -m uvicorn main:app --reload

# Custom port
python3 -m uvicorn main:app --port 5000 --reload

# Production (no reload)
python3 -m uvicorn main:app
```

### Frontend Commands
```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## API Endpoints

- `GET /ping` - Health check
- `POST /chat` - Send message and get AI response
  - Request: `{ "message": "your message" }`
  - Response: `{ "reply": "AI response" }`

## Troubleshooting

### Backend won't start
- Check Python 3.8+ is installed: `python3 --version`
- Verify `.env` file exists with valid Groq API key
- Port 8000 already in use? Use `--port 5000`

### Frontend won't connect to backend
- Ensure backend is running on port 8000
- Check browser console for errors (F12)
- Clear browser cache and reload

### Rate limiting errors
- Groq free tier: 30 requests/minute
- Wait a minute before making more requests
- Upgrade plan for higher limits
