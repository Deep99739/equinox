
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Outlet, Routes, Route, useLocation } from 'react-router-dom';
import ChatPage from './pages/Chat/ChatPage';
import './App.css';
import HomePage from './pages/Home/HomePage';
import AgentsPage from './pages/Agents/AgentsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotesPage from './pages/Productivity/NotesPage';
import TodosPage from './pages/Productivity/TodosPage';
import WellnessPage from './pages/Wellness/WellnessPage';
import { Contact } from './pages/Contact/Contact';
import BriefingPage from './pages/Briefing/BriefingPage';
import HealthLogPopup from './components/HealthLogPopup/HealthLogPopup';
import { getTodayHealth } from './api/healthApi';
import { fetchSession, SessionUnauthenticatedError, type SessionStatus } from './api/authApi';
import { clearAuth, setAuth } from './utils/authUtils';

function ProtectedLayout() {
  const location = useLocation();
  const [session, setSession] = useState<SessionStatus>('checking');
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const [showHealthPopup, setShowHealthPopup] = useState(false);
  const [healthChecked, setHealthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSession()
      .then(({ email }) => {
        if (cancelled) return;
        setAuth(email);
        setSession('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof SessionUnauthenticatedError) {
          clearAuth();
          setSession('signed_out');
        } else {
          setSession('unavailable');
        }
      });
    return () => { cancelled = true; };
  }, [sessionAttempt]);

  useEffect(() => {
    if (session !== 'ready' || location.pathname === '/wellness' || healthChecked) return;
    let cancelled = false;
    getTodayHealth()
      .then(log => {
        if (cancelled) return;
        if (!log) setShowHealthPopup(true);
        setHealthChecked(true);
      })
      .catch(() => {
        if (cancelled) return;
        setShowHealthPopup(true);
        setHealthChecked(true);
      });
    return () => { cancelled = true; };
  }, [location.pathname, healthChecked, session]);

  const handlePopupClose = () => {
    setShowHealthPopup(false);
  };

  const handleHealthLogged = () => {
    setHealthChecked(true);
  };

  if (session === 'signed_out') return <Navigate to="/" replace />;
  if (session === 'checking') {
    return <main className="session-unavailable" role="status">Checking your sign-in...</main>;
  }
  if (session === 'unavailable') {
    return (
      <main className="session-unavailable" role="alert">
        <p>Could not check your sign-in. Your session may still be active.</p>
        <button type="button" onClick={() => {
          setSession('checking');
          setSessionAttempt(attempt => attempt + 1);
        }}>Retry</button>
      </main>
    );
  }

  return (
    <>
      <Outlet />

      {showHealthPopup && (
        <HealthLogPopup
          onClose={handlePopupClose}
          onLogged={handleHealthLogged}
        />
      )}
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/contact" element={<Contact />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:email/:threadId" element={<ChatPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/todos" element={<TodosPage />} />
        <Route path="/wellness" element={<WellnessPage />} />
        <Route path="/briefing" element={<BriefingPage />} />
      </Route>
    </Routes>
  );
}


function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
