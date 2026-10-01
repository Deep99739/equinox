import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Plus, Trash2 } from "lucide-react";
import {
  addTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  type Todo,
} from "../../api/todosApi";
import { getUserEmail } from "../../utils/authUtils";

type Filter = "open" | "all" | "done";
export default function TodosPage() {
  const email = getUserEmail();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("view");
  const filter: Filter =
    requested === "done" || requested === "all" ? requested : "open";
  const [loading, setLoading] = useState(Boolean(email));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(
    email ? "" : "Your account could not be found.",
  );
  useEffect(() => {
    if (!email) return;
    let active = true;
    fetchTodos(email)
      .then((data) => {
        if (active) setTodos(data);
      })
      .catch(() => {
        if (active)
          setError("Tasks could not load. Refresh the page to try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [email]);
  async function add(event: FormEvent) {
    event.preventDefault();
    if (!email || !draft.trim()) return;
    setSaving(true);
    setError("");
    try {
      const created = await addTodo({ user_email: email, text: draft.trim() });
      setTodos((current) => [created, ...current]);
      setDraft("");
      setSearchParams({});
    } catch {
      setError("Could not add your task. Try again.");
    } finally {
      setSaving(false);
    }
  }
  async function toggle(todo: Todo) {
    setError("");
    try {
      const updated = await updateTodo(
        todo.id,
        { completed: !todo.completed },
        email || undefined,
      );
      setTodos((current) =>
        current.map((item) => (item.id === todo.id ? updated : item)),
      );
    } catch {
      setError("Could not update this task. Try again.");
    }
  }
  async function remove(todo: Todo) {
    if (!window.confirm(`Delete “${todo.text}”?`)) return;
    try {
      await deleteTodo(todo.id, email || undefined);
      setTodos((current) => current.filter((item) => item.id !== todo.id));
    } catch {
      setError("Could not delete this task. Try again.");
    }
  }
  const shown = todos.filter(
    (todo) =>
      filter === "all" ||
      (filter === "done" ? todo.completed : !todo.completed),
  );
  const openCount = todos.filter((todo) => !todo.completed).length;
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Make it manageable</p>
          <h1>
            Tasks<span className="heading-dot">.</span>
          </h1>
          <p className="page-subtitle">
            Keep track of what matters, one thing at a time.
          </p>
        </div>
        <span className="heading-count">{openCount} open</span>
      </div>
      <section className="workspace-panel tasks-panel">
        <form className="quick-add" onSubmit={add}>
          <Plus size={19} aria-hidden="true" />
          <label className="sr-only" htmlFor="new-task">
            New task
          </label>
          <input
            id="new-task"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a task…"
          />
          <button type="submit" disabled={!draft.trim() || saving}>
            {saving ? "Adding…" : "Add task"}
          </button>
        </form>
        <div className="list-toolbar">
          <div className="segmented-control" aria-label="Filter tasks">
            {(
              [
                ["open", "To do"],
                ["all", "All"],
                ["done", "Completed"],
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={filter === value ? "selected" : ""}
                aria-pressed={filter === value}
                onClick={() =>
                  setSearchParams(value === "open" ? {} : { view: value })
                }
              >
                {label}
              </button>
            ))}
          </div>
          <span>
            {shown.length} {shown.length === 1 ? "task" : "tasks"}
          </span>
        </div>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p className="list-state" role="status">
            Loading tasks…
          </p>
        ) : shown.length ? (
          <ul className="task-list">
            {shown.map((todo) => (
              <li key={todo.id} className={todo.completed ? "is-done" : ""}>
                <button
                  type="button"
                  className="check-button"
                  aria-label={
                    todo.completed
                      ? `Mark ${todo.text} incomplete`
                      : `Complete ${todo.text}`
                  }
                  aria-pressed={todo.completed}
                  onClick={() => void toggle(todo)}
                >
                  <Check size={15} />
                </button>
                <span>{todo.text}</span>
                <button
                  type="button"
                  className="icon-button task-delete"
                  aria-label={`Delete ${todo.text}`}
                  onClick={() => void remove(todo)}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="list-state">
            <span className="empty-symbol">✓</span>
            <h2>
              {filter === "done"
                ? "Nothing completed yet"
                : filter === "open" && todos.length
                  ? "You’re all caught up"
                  : "Start with one thing"}
            </h2>
            <p>
              {filter === "done"
                ? "Finished tasks will appear here."
                : filter === "open" && todos.length
                  ? "Every task is complete. Enjoy the space."
                  : "Add a task above and it will appear here."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
