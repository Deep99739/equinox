import { useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  HeartPulse,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { simulateFatigue } from "../../api/supervisorAgentApi";

const parts = [
  {
    icon: MessageCircle,
    title: "An assistant for your day",
    text: "Ask a question in chat. The general assistant can help you think through work and personal plans.",
    to: "/chat",
    action: "Start a conversation",
  },
  {
    icon: HeartPulse,
    title: "A place to check in",
    text: "Log sleep, energy, stress, and mood. Equinox uses your entries to show a daily readiness view.",
    to: "/wellness",
    action: "Open wellness",
  },
  {
    icon: BookOpenText,
    title: "A summary when you want it",
    text: "Generate a briefing from your tasks, check-in, and connected email. Nothing is sent until you choose to send it.",
    to: "/briefing",
    action: "See briefing",
  },
];
export default function AgentsPage() {
  const [fatigue, setFatigue] = useState(5);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function ask() {
    setLoading(true);
    setError("");
    setReply("");
    try {
      const result = await simulateFatigue(fatigue);
      setReply(result.reply);
    } catch {
      setError("The assistant could not respond. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="page-wrap agents-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Under the surface</p>
          <h1>
            How Equinox works<span className="heading-dot">.</span>
          </h1>
          <p className="page-subtitle">
            A few useful tools that work better together.
          </p>
        </div>
      </div>
      <div className="agents-lead">
        <span>
          <Sparkles size={23} />
        </span>
        <div>
          <h2>One workspace, a clearer day.</h2>
          <p>
            Tasks and notes give you a place to collect things. A check-in adds
            personal context. Chat and briefings help you make sense of it all.
          </p>
        </div>
      </div>
      <div className="capability-list">
        {parts.map(({ icon: Icon, title, text, to, action }, index) => (
          <section key={title}>
            <span className="capability-number">0{index + 1}</span>
            <span className="capability-icon">
              <Icon size={21} />
            </span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
              <Link className="text-link" to={to}>
                {action} <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        ))}
      </div>
      <section className="agent-demo">
        <div>
          <p className="section-kicker">Try it here</p>
          <h2>Ask about your energy</h2>
          <p>
            Tell the assistant how fatigued you feel. It can respond using your
            logged wellness context when available.
          </p>
        </div>
        <div className="agent-demo-controls">
          <label htmlFor="fatigue-level">
            Fatigue level <strong>{fatigue}/10</strong>
          </label>
          <input
            id="fatigue-level"
            type="range"
            min="0"
            max="10"
            value={fatigue}
            onChange={(event) => setFatigue(Number(event.target.value))}
          />
          <button
            type="button"
            className="button button-primary"
            onClick={() => void ask()}
            disabled={loading}
          >
            {loading ? "Thinking…" : "Get a suggestion"}
          </button>
        </div>
        {reply && (
          <div className="agent-demo-response" role="status">
            <strong>Equinox says</strong>
            <p>{reply}</p>
          </div>
        )}
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
