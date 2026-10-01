import { Hero } from "./Components/hero";
import { Features } from "./Components/features";
import { HowItWorks } from "./Components/how-it-works";
import { MorningBriefing } from "./Components/morning-briefing";
import { CTA } from "./Components/cta";
import './styles/styles.css';
import { Navbar } from '../../components/Navbar/Navbar';
import SignedInNavbar from '../../components/Navbar/SignedInNavbar';
import { useEffect, useState } from 'react';
import { fetchSession, SessionUnauthenticatedError, type SessionStatus } from '../../api/authApi';
import { clearAuth, setAuth, signOut } from '../../utils/authUtils';

export default function Home() {
  const [session, setSession] = useState<SessionStatus>('checking');
  const [sessionAttempt, setSessionAttempt] = useState(0);

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

  const signedIn = session === 'ready';

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <>
      {signedIn ? (
        <SignedInNavbar onSignOut={handleSignOut} />
      ) : session === 'signed_out' ? (
        <Navbar />
      ) : null}
      {session === 'checking' && (
        <div className="session-unavailable" role="status">Checking your sign-in...</div>
      )}
      {session === 'unavailable' && (
        <div className="session-unavailable" role="alert">
          <p>Could not check your sign-in. Your session may still be active.</p>
          <button type="button" onClick={() => {
            setSession('checking');
            setSessionAttempt(attempt => attempt + 1);
          }}>Retry</button>
        </div>
      )}
      <main className="min-h-screen bg-background">
        <Hero session={session} />
        <Features />
        <HowItWorks />
        <MorningBriefing session={session} />
        <CTA session={session} />
        {/* <Footer /> */}
      </main>
    </>
  );
}
