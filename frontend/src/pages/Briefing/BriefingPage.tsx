import { useState } from "react";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {
  generateBriefing,
  sendBriefingEmail,
  type BriefingResponse,
} from "../../api/briefingApi";
import { fetchTodos, type Todo } from "../../api/todosApi";
import { getUserEmail } from "../../utils/authUtils";

export default function BriefingPage() {
  const email = getUserEmail();
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function generate() {
    if (!email) return;
    setLoading(true);
    setError("");
    setSent(false);
    try {
      const result = await generateBriefing(email);
      setBriefing(result);
      try {
        setTasks((await fetchTodos(email)).filter((todo) => !todo.completed));
      } catch {
        setTasks([]);
      }
    } catch {
      setError(
        "Your briefing could not be generated right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function sendEmail() {
    if (!email) return;
    setSending(true);
    setError("");
    try {
      await sendBriefingEmail(email);
      setSent(true);
    } catch {
      setError(
        "Email could not be sent. Check your Google connection in Settings, then try again.",
      );
    } finally {
      setSending(false);
    }
  }
  const unread = briefing?.unread_emails ?? briefing?.critical_emails;
  return (
    <div className="page-wrap briefing-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">A wider view</p>
          <h1>
            Daily briefing<span className="heading-dot">.</span>
          </h1>
          <p className="page-subtitle">
            Bring the moving parts of your day into one readable summary.
          </p>
        </div>
      </div>
      {!briefing ? (
        <section className="briefing-intro">
          <span className="briefing-sparkle">
            <Sparkles size={27} />
          </span>
          <h2>A little clarity goes a long way.</h2>
          <p>
            Your briefing can combine your open tasks, wellness check-in, and
            connected email. Generate one whenever you want a fresh view.
          </p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => void generate()}
            disabled={loading || !email}
          >
            {loading ? "Putting it together…" : "Generate my briefing"}{" "}
            <ArrowRight size={16} />
          </button>
          <div className="briefing-inputs">
            <span>Tasks</span>
            <span>Wellness</span>
            <span>Connected email</span>
          </div>
        </section>
      ) : (
        <div className="briefing-result">
          <div className="briefing-result-top">
            <span className="section-kicker">Your briefing</span>
            <button
              type="button"
              className="text-link button-link"
              onClick={() => void generate()}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh briefing"}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
          <h2>{briefing.greeting}</h2>
          {briefing.summary && (
            <p className="briefing-summary">{briefing.summary}</p>
          )}
          <div className="briefing-facts">
            <div>
              <span>Open tasks</span>
              <strong>{briefing.tasks_count}</strong>
            </div>
            <div>
              <span>Unread email</span>
              <strong>{unread == null ? "—" : unread}</strong>
            </div>
            <div>
              <span>Sleep score</span>
              <strong>
                {briefing.sleep_score == null ? "—" : briefing.sleep_score}
              </strong>
            </div>
          </div>
          {tasks.length > 0 && (
            <details className="briefing-tasks">
              <summary>
                See open tasks <span>{tasks.length}</span>
              </summary>
              <ul>
                {tasks.map((task) => (
                  <li key={task.id}>{task.text}</li>
                ))}
              </ul>
            </details>
          )}
          <div className="briefing-result-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => void sendEmail()}
              disabled={sending || sent}
            >
              <Mail size={16} />{" "}
              {sending ? "Sending…" : sent ? "Sent to email" : "Send to email"}
            </button>
            <Link to="/today" className="text-link">
              Back to today <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <p className="inline-success" role="status">
          Briefing sent to your email.
        </p>
      )}
    </div>
  );
}
