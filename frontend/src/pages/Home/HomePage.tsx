import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  Check,
  HeartPulse,
  Menu,
  MessageCircle,
  X,
} from "lucide-react";
import {
  fetchSession,
  SessionUnauthenticatedError,
  handleGoogleSignIn,
  type SessionStatus,
} from "../../api/authApi";
import { clearAuth, setAuth } from "../../utils/authUtils";

export default function HomePage() {
  const [session, setSession] = useState<SessionStatus>("checking");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    let active = true;
    fetchSession()
      .then(({ email }) => {
        if (active) {
          setAuth(email);
          setSession("ready");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          if (error instanceof SessionUnauthenticatedError) {
            clearAuth();
            setSession("signed_out");
          } else setSession("unavailable");
        }
      });
    return () => {
      active = false;
    };
  }, []);
  const signedIn = session === "ready";
  const action = signedIn ? (
    <Link className="button button-primary" to="/today">
      Open my space <ArrowRight size={17} />
    </Link>
  ) : (
    <button
      type="button"
      className="button button-primary"
      onClick={() => void handleGoogleSignIn()}
    >
      Get started with Google <ArrowRight size={17} />
    </button>
  );
  return (
    <div className="marketing">
      <a href="#marketing-content" className="skip-link">
        Skip to content
      </a>
      <header className="marketing-header">
        <div className="marketing-header-inner">
          <Link to="/" className="wordmark">
            <span className="brand-mark" />
            equinox<span className="wordmark-period">.</span>
          </Link>
          <nav
            className={`marketing-nav${menuOpen ? " is-open" : ""}`}
            aria-label="Main"
          >
            <a href="#product" onClick={() => setMenuOpen(false)}>
              Product
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </nav>
          <div className="marketing-actions">
            {signedIn ? (
              <Link to="/today" className="header-signin">
                Go to app <ArrowUpRight size={16} />
              </Link>
            ) : (
              <button
                type="button"
                className="header-signin"
                onClick={() => void handleGoogleSignIn()}
              >
                Sign in <ArrowUpRight size={16} />
              </button>
            )}
          </div>
          <button
            className="icon-button marketing-menu"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>
      <main id="marketing-content">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A calmer way to keep up</p>
            <h1>
              Make room for <em>your day.</em>
            </h1>
            <p className="hero-description">
              Tasks, wellbeing, and an assistant that helps you connect the
              dots. All in one simple space.
            </p>
            <div className="hero-actions">
              {action}
              <a className="quiet-link" href="#product">
                Explore the product <ArrowRight size={17} />
              </a>
            </div>
          </div>
          <div className="hero-preview">
            <img
              className="real-product-preview"
              src="/equinox-today-preview.png"
              alt="Equinox Today workspace with sample tasks, navigation, and a daily check-in"
              width={1080}
              height={700}
              fetchPriority="high"
            />
            <span className="preview-caption">
              Real product screen shown with sample tasks.
            </span>
          </div>
        </section>
        <section className="product-section" id="product">
          <div className="marketing-container">
            <div className="section-intro">
              <p className="eyebrow">One place to begin</p>
              <h2>
                Less switching.
                <br />
                <em>More living.</em>
              </h2>
              <p>
                Equinox brings the small pieces of a busy day together, without
                asking you to manage another complicated system.
              </p>
            </div>
            <div className="product-grid">
              <article className="product-feature feature-tasks">
                <div className="feature-icon">
                  <Check size={20} />
                </div>
                <h3>Keep a clear task list</h3>
                <p>
                  Capture what needs doing, see what is still open, and check
                  things off as you go.
                </p>
                <div className="feature-visual feature-task-list">
                  <span>
                    <i /> Prepare for the week
                  </span>
                  <span>
                    <i /> Follow up on the idea
                  </span>
                  <span>
                    <i /> Take a real break
                  </span>
                </div>
              </article>
              <article className="product-feature feature-wellness">
                <div className="feature-icon">
                  <HeartPulse size={20} />
                </div>
                <h3>Notice how you feel</h3>
                <p>
                  Log sleep, energy, and stress when it helps. Your check-in
                  stays available in the same space as your plans.
                </p>
                <div className="wellness-visual">
                  <span>Today’s check-in</span>
                  <strong>How’s your energy?</strong>
                  <div className="energy-scale">
                    <b>Low</b>
                    <i />
                    <i />
                    <i />
                    <i className="selected" />
                    <i />
                    <b>High</b>
                  </div>
                </div>
              </article>
              <article className="product-feature feature-assistant">
                <div className="feature-icon">
                  <MessageCircle size={20} />
                </div>
                <h3>Ask when you need help</h3>
                <p>
                  Use the assistant to think through a task, check your plans,
                  or make sense of your day.
                </p>
                <div className="assistant-visual">
                  <span>What should I focus on?</span>
                  <p>
                    Let’s start with your open tasks, then decide what matters
                    most.
                  </p>
                </div>
              </article>
              <article className="product-feature feature-briefing">
                <div className="feature-icon">
                  <BookOpenText size={20} />
                </div>
                <h3>See the whole picture</h3>
                <p>
                  Generate a briefing that pulls together your tasks, check-in,
                  and connected email.
                </p>
                <div className="briefing-visual">
                  <small>YOUR BRIEFING</small>
                  <strong>A thoughtful start to today.</strong>
                  <span>
                    Tasks <i /> Wellbeing <i /> Email
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section className="how-section" id="how-it-works">
          <div className="marketing-container how-grid">
            <div>
              <p className="eyebrow">Made for real days</p>
              <h2>
                Useful when life is full.
                <br />
                <em>Quiet when it isn’t.</em>
              </h2>
            </div>
            <div className="how-steps">
              <div>
                <span>01</span>
                <div>
                  <h3>Start with today</h3>
                  <p>See your open tasks and decide where to begin.</p>
                </div>
              </div>
              <div>
                <span>02</span>
                <div>
                  <h3>Check in on yourself</h3>
                  <p>
                    Log how you feel when you want more context for your day.
                  </p>
                </div>
              </div>
              <div>
                <span>03</span>
                <div>
                  <h3>Ask or reflect</h3>
                  <p>
                    Chat with Equinox or generate a briefing when you need a
                    wider view.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="marketing-cta">
          <div className="marketing-container">
            <p className="eyebrow">Your day is yours</p>
            <h2>
              Find a little more space
              <br />
              for what matters.
            </h2>
            {action}
          </div>
        </section>
      </main>
      <footer className="marketing-footer">
        <div className="marketing-container">
          <Link to="/" className="wordmark">
            <span className="brand-mark" />
            equinox<span className="wordmark-period">.</span>
          </Link>
          <span>Built for a more balanced day.</span>
          <Link to="/contact">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
