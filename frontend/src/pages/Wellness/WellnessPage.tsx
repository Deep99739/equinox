import { useEffect, useState, type FormEvent } from "react";
import { Activity, ArrowRight, HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getReadiness,
  getTodayHealth,
  logHealth,
  type HealthLogInput,
  type HealthLogResponse,
  type ReadinessResponse,
} from "../../api/healthApi";
import { getUserEmail } from "../../utils/authUtils";

const initial: HealthLogInput = {
  sleep_hours: 7,
  sleep_quality: 7,
  energy_level: 7,
  stress_level: 5,
  mood_score: 7,
  activity_minutes: 0,
  steps: 0,
  water_glasses: 0,
  caffeine_cups: 0,
  notes: "",
};
const scales = [
  {
    key: "sleep_quality",
    label: "Sleep quality",
    low: "Restless",
    high: "Restful",
  },
  { key: "energy_level", label: "Energy", low: "Low", high: "High" },
  { key: "stress_level", label: "Stress", low: "Low", high: "High" },
  { key: "mood_score", label: "Mood", low: "Low", high: "Good" },
] as const;
export default function WellnessPage() {
  const email = getUserEmail();
  const [form, setForm] = useState<HealthLogInput>({
    ...initial,
    user_email: email || undefined,
  });
  const [log, setLog] = useState<HealthLogResponse | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(email));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(
    email ? "" : "Your account could not be found.",
  );
  const [success, setSuccess] = useState("");
  useEffect(() => {
    if (!email) return;
    let active = true;
    Promise.allSettled([getTodayHealth(email), getReadiness(email)]).then(
      ([logResult, scoreResult]) => {
        if (!active) return;
        if (logResult.status === "fulfilled" && logResult.value) {
          const value = logResult.value;
          setLog(value);
          setForm({
            user_email: email,
            sleep_hours: value.sleep_hours,
            sleep_quality: value.sleep_quality,
            energy_level: value.energy_level,
            stress_level: value.stress_level,
            mood_score: value.mood_score,
            activity_minutes: value.activity_minutes,
            steps: value.steps,
            water_glasses: value.water_glasses,
            caffeine_cups: value.caffeine_cups,
            notes: value.notes || "",
          });
        }
        if (logResult.status === "rejected")
          setError(
            "Your check-in could not load. You can still enter a new one.",
          );
        if (scoreResult.status === "fulfilled") setReadiness(scoreResult.value);
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [email]);
  function change(key: keyof HealthLogInput, value: string | number) {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const saved = await logHealth(form);
      setLog(saved);
      try {
        setReadiness(await getReadiness(email || undefined));
      } catch {
        setReadiness(null);
      }
      setSuccess("Today’s check-in has been saved.");
    } catch {
      setError("Could not save your check-in. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="page-wrap wellness-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">A moment for yourself</p>
          <h1>
            Wellness<span className="heading-dot">.</span>
          </h1>
          <p className="page-subtitle">
            Notice how you feel. You can update your check-in as the day
            changes.
          </p>
        </div>
      </div>
      {readiness && (
        <section className="readiness-panel">
          <div className="readiness-number">
            <strong>{readiness.score}</strong>
            <span>{readiness.zone}</span>
          </div>
          <div>
            <p className="section-kicker">Today’s readiness</p>
            <h2>A little context for your day</h2>
            <p>{readiness.summary}</p>
            {readiness.suggestions?.length > 0 && (
              <ul>
                {readiness.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
      <form className="workspace-panel wellness-form" onSubmit={submit}>
        <div className="form-intro">
          <span className="form-icon">
            <HeartPulse size={21} />
          </span>
          <div>
            <h2>
              {log ? "Update today’s check-in" : "Check in with yourself"}
            </h2>
            <p>A few quick answers help give your day more context.</p>
          </div>
        </div>
        {loading ? (
          <p className="muted-line" role="status">
            Loading your check-in…
          </p>
        ) : (
          <>
            <div className="form-group-row">
              <label className="field-label" htmlFor="sleep-hours">
                Hours of sleep{" "}
                <input
                  id="sleep-hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  required
                  value={form.sleep_hours}
                  onChange={(event) =>
                    change("sleep_hours", Number(event.target.value))
                  }
                />
              </label>
              <p className="field-hint">How long did you sleep last night?</p>
            </div>
            <div className="scale-grid">
              {scales.map(({ key, label, low, high }) => (
                <label className="scale-field" key={key} htmlFor={key}>
                  <span className="scale-label">
                    {label}
                    <strong>{form[key]}/10</strong>
                  </span>
                  <input
                    id={key}
                    type="range"
                    min="1"
                    max="10"
                    value={form[key]}
                    onChange={(event) =>
                      change(key, Number(event.target.value))
                    }
                  />
                  <span className="scale-ends">
                    <small>{low}</small>
                    <small>{high}</small>
                  </span>
                </label>
              ))}
            </div>
            <details className="extra-details">
              <summary>
                <Activity size={17} /> Add activity and daily details{" "}
                <span>Optional</span>
              </summary>
              <div className="extra-grid">
                <label className="field-label" htmlFor="activity">
                  Activity minutes
                  <input
                    id="activity"
                    type="number"
                    min="0"
                    value={form.activity_minutes ?? 0}
                    onChange={(event) =>
                      change("activity_minutes", Number(event.target.value))
                    }
                  />
                </label>
                <label className="field-label" htmlFor="steps">
                  Steps
                  <input
                    id="steps"
                    type="number"
                    min="0"
                    value={form.steps ?? 0}
                    onChange={(event) =>
                      change("steps", Number(event.target.value))
                    }
                  />
                </label>
                <label className="field-label" htmlFor="water">
                  Glasses of water
                  <input
                    id="water"
                    type="number"
                    min="0"
                    value={form.water_glasses ?? 0}
                    onChange={(event) =>
                      change("water_glasses", Number(event.target.value))
                    }
                  />
                </label>
                <label className="field-label" htmlFor="caffeine">
                  Cups of caffeine
                  <input
                    id="caffeine"
                    type="number"
                    min="0"
                    value={form.caffeine_cups ?? 0}
                    onChange={(event) =>
                      change("caffeine_cups", Number(event.target.value))
                    }
                  />
                </label>
              </div>
              <label className="field-label" htmlFor="wellness-notes">
                Anything else on your mind?
                <textarea
                  id="wellness-notes"
                  rows={3}
                  value={form.notes ?? ""}
                  onChange={(event) => change("notes", event.target.value)}
                  placeholder="Optional note…"
                />
              </label>
            </details>
            {error && (
              <p className="inline-error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="inline-success" role="status">
                {success}
              </p>
            )}
            <div className="form-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : log ? "Update check-in" : "Save check-in"}
              </button>
              {log && (
                <Link to="/briefing" className="text-link">
                  See your briefing <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </>
        )}
      </form>
      <p className="wellness-note">
        This check-in is a reflection tool and is not medical advice.
      </p>
    </div>
  );
}
