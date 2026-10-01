import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, MessageCircle, Plus } from "lucide-react";
import { addTodo, fetchTodos, updateTodo, type Todo } from "../../api/todosApi";
import { getTodayHealth, type HealthLogResponse } from "../../api/healthApi";
import { getUserEmail } from "../../utils/authUtils";

export default function TodayPage() {
  const email = getUserEmail();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [health, setHealth] = useState<HealthLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskError, setTaskError] = useState("");
  const [healthError, setHealthError] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!email) return;
    let active = true;
    Promise.allSettled([fetchTodos(email), getTodayHealth(email)]).then(
      ([taskResult, healthResult]) => {
        if (!active) return;
        if (taskResult.status === "fulfilled") setTodos(taskResult.value);
        else setTaskError("Tasks could not load. Open Tasks to try again.");
        if (healthResult.status === "fulfilled") setHealth(healthResult.value);
        else setHealthError(true);
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [email]);

  const open = todos.filter((todo) => !todo.completed);
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  async function addTask(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || !email) return;
    setSaving(true);
    setTaskError("");
    try {
      const task = await addTodo({ user_email: email, text: draft.trim() });
      setTodos((current) => [task, ...current]);
      setDraft("");
    } catch {
      setTaskError("Could not add the task. Try again.");
    } finally {
      setSaving(false);
    }
  }
  async function complete(todo: Todo) {
    try {
      const updated = await updateTodo(
        todo.id,
        { completed: true },
        email || undefined,
      );
      setTodos((current) =>
        current.map((item) => (item.id === todo.id ? updated : item)),
      );
    } catch {
      setTaskError("Could not complete the task. Try again.");
    }
  }

  return (
    <div className="page-wrap today-page">
      <div className="page-heading today-heading">
        <div>
          <p className="eyebrow">Your day, in one place</p>
          <h1>
            {greeting}
            <span className="heading-dot">.</span>
          </h1>
          <p className="page-subtitle">
            A clear place to begin, and a little room to breathe.
          </p>
        </div>
      </div>
      <section className="today-primary" aria-labelledby="today-tasks-title">
        <div className="section-top">
          <div>
            <p className="section-kicker">01 / Focus</p>
            <h2 id="today-tasks-title">What needs your attention</h2>
          </div>
          <Link className="text-link" to="/todos">
            All tasks <ArrowRight size={16} />
          </Link>
        </div>
        <form className="quick-add" onSubmit={addTask}>
          <Plus size={19} aria-hidden="true" />
          <label className="sr-only" htmlFor="today-task">
            Add a task
          </label>
          <input
            id="today-task"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add something to do…"
          />
          <button type="submit" disabled={!draft.trim() || saving}>
            {saving ? "Adding…" : "Add task"}
          </button>
        </form>
        {taskError && (
          <p className="inline-error" role="alert">
            {taskError}
          </p>
        )}
        {loading ? (
          <p className="muted-line" role="status">
            Loading your day…
          </p>
        ) : open.length ? (
          <ul className="focus-list">
            {open.slice(0, 4).map((todo) => (
              <li key={todo.id}>
                <button
                  type="button"
                  className="check-button"
                  aria-label={`Complete ${todo.text}`}
                  onClick={() => void complete(todo)}
                >
                  <Check size={15} />
                </button>
                <span>{todo.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          !taskError && (
            <div className="calm-empty">
              <span className="empty-symbol">✓</span>
              <strong>A little breathing room.</strong>
              <p>Add your first task above when you’re ready.</p>
            </div>
          )
        )}
      </section>
      <div className="today-secondary">
        <section className="daily-panel" aria-labelledby="checkin-title">
          <p className="section-kicker">02 / Check in</p>
          <h2 id="checkin-title">How are you feeling?</h2>
          <p>
            {healthError
              ? "Your check-in is unavailable right now."
              : health
                ? `Today you logged ${health.sleep_hours} hours of sleep and an energy level of ${health.energy_level}/10.`
                : "A quick check-in can put your day in context."}
          </p>
          <Link className="panel-link" to="/wellness">
            {health ? "View your check-in" : "Check in"}{" "}
            <ArrowRight size={17} />
          </Link>
        </section>
        <section className="daily-panel" aria-labelledby="briefing-title">
          <p className="section-kicker">03 / See the whole picture</p>
          <h2 id="briefing-title">A daily briefing</h2>
          <p>
            Bring your tasks, wellness check-in, and connected email into one
            summary.
          </p>
          <Link className="panel-link" to="/briefing">
            Open briefing <ArrowRight size={17} />
          </Link>
        </section>
      </div>
      <Link className="today-chat-link" to="/chat">
        <span className="chat-link-icon">
          <MessageCircle size={21} />
        </span>
        <span>
          <strong>Have something on your mind?</strong>
          <small>Ask Equinox about your tasks, plans, or wellbeing.</small>
        </span>
        <ArrowRight size={19} />
      </Link>
    </div>
  );
}
