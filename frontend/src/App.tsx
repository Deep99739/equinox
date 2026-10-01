import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import ChatPage from "./pages/Chat/ChatPage";
import HomePage from "./pages/Home/HomePage";
import AgentsPage from "./pages/Agents/AgentsPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import NotesPage from "./pages/Productivity/NotesPage";
import TodosPage from "./pages/Productivity/TodosPage";
import WellnessPage from "./pages/Wellness/WellnessPage";
import BriefingPage from "./pages/Briefing/BriefingPage";
import TodayPage from "./pages/Today/TodayPage";
import { Contact } from "./pages/Contact/Contact";
import { AppShell } from "./components/AppShell/AppShell";
import {
  fetchSession,
  SessionUnauthenticatedError,
  type SessionStatus,
} from "./api/authApi";
import { clearAuth, setAuth } from "./utils/authUtils";
import "./App.css";

function ProtectedLayout() {
  const [session, setSession] = useState<SessionStatus>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    fetchSession()
      .then(({ email }) => {
        if (!active) return;
        setAuth(email);
        setSession("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof SessionUnauthenticatedError) {
          clearAuth();
          setSession("signed_out");
        } else setSession("unavailable");
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  if (session === "signed_out") return <Navigate to="/" replace />;
  if (session === "checking")
    return (
      <main className="session-state" role="status">
        <span className="brand-mark" />
        Checking your session…
      </main>
    );
  if (session === "unavailable")
    return (
      <main className="session-state" role="alert">
        <h1>We couldn’t check your session</h1>
        <p>Your connection may be interrupted. Try again to continue.</p>
        <button
          className="button button-primary"
          onClick={() => {
            setSession("checking");
            setAttempt((value) => value + 1);
          }}
        >
          Try again
        </button>
      </main>
    );
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/today" element={<TodayPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:email/:threadId" element={<ChatPage />} />
          <Route path="/todos" element={<TodosPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/wellness" element={<WellnessPage />} />
          <Route path="/briefing" element={<BriefingPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
