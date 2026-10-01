import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  addNote,
  deleteNote,
  fetchNotes,
  updateNote,
} from "../../api/notesApi";
import { getUserEmail } from "../../utils/authUtils";

type Note = {
  id: string;
  title: string;
  content: string;
  user_email: string;
  source: string;
  updated_at?: string;
};
export default function NotesPage() {
  const email = getUserEmail();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(email));
  const [error, setError] = useState(
    email ? "" : "Your account could not be found.",
  );
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const timer = useRef<number | null>(null);
  const pending = useRef<{
    id: string;
    changes: { title?: string; content?: string };
  } | null>(null);
  useEffect(() => {
    if (!email) return;
    let active = true;
    fetchNotes(email)
      .then((data: Note[]) => {
        if (active) {
          setNotes(data);
          setSelectedId(data[0]?.id || null);
        }
      })
      .catch(() => {
        if (active)
          setError("Notes could not load. Refresh the page to try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [email]);
  const save = useCallback(
    async (id: string, changes: { title?: string; content?: string }) => {
      try {
        await updateNote(id, changes);
        setSaveState("saved");
      } catch {
        setSaveState("error");
        setError(
          "Your latest changes could not be saved. Copy them before leaving this page.",
        );
      }
    },
    [],
  );
  const flush = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    const item = pending.current;
    pending.current = null;
    if (item) void save(item.id, item.changes);
  }, [save]);
  useEffect(() => () => flush(), [flush]);
  function update(field: "title" | "content", value: string) {
    if (!selectedId) return;
    setNotes((current) =>
      current.map((note) =>
        note.id === selectedId ? { ...note, [field]: value } : note,
      ),
    );
    if (pending.current?.id !== selectedId) flush();
    pending.current = {
      id: selectedId,
      changes: { ...(pending.current?.changes || {}), [field]: value },
    };
    setSaveState("saving");
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, 650);
  }
  async function create() {
    if (!email) return;
    flush();
    setError("");
    try {
      const created: Note = await addNote({
        user_email: email,
        title: "",
        content: "",
        source: "user",
      });
      setNotes((current) => [created, ...current]);
      setSelectedId(created.id);
    } catch {
      setError("Could not create a note. Try again.");
    }
  }
  async function remove(note: Note) {
    if (!window.confirm(`Delete “${note.title || "Untitled note"}”?`)) return;
    if (pending.current?.id === note.id) {
      pending.current = null;
      if (timer.current !== null) clearTimeout(timer.current);
    } else flush();
    try {
      await deleteNote(note.id);
      setNotes((current) => current.filter((item) => item.id !== note.id));
      if (selectedId === note.id)
        setSelectedId(notes.find((item) => item.id !== note.id)?.id || null);
    } catch {
      setError("Could not delete the note. Try again.");
    }
  }
  const selected = notes.find((note) => note.id === selectedId);
  return (
    <div className="page-wrap notes-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Keep a thought</p>
          <h1>
            Notes<span className="heading-dot">.</span>
          </h1>
          <p className="page-subtitle">
            A simple place for the things you want to remember.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => void create()}
        >
          <Plus size={17} /> New note
        </button>
      </div>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      <div className="notes-workspace">
        <aside className="note-list" aria-label="Your notes">
          <div className="note-list-heading">
            Your notes <span>{notes.length}</span>
          </div>
          {loading ? (
            <p className="muted-line">Loading notes…</p>
          ) : notes.length ? (
            notes.map((note) => (
              <div
                className={`note-row${selectedId === note.id ? " selected" : ""}`}
                key={note.id}
              >
                <button
                  type="button"
                  onClick={() => {
                    flush();
                    setSelectedId(note.id);
                  }}
                  aria-current={selectedId === note.id ? "true" : undefined}
                >
                  <strong>{note.title || "Untitled note"}</strong>
                  <small>{note.content?.slice(0, 65) || "No text yet"}</small>
                </button>
                <button
                  type="button"
                  className="icon-button note-delete"
                  aria-label={`Delete ${note.title || "Untitled note"}`}
                  onClick={() => void remove(note)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <div className="note-list-empty">
              No notes yet.
              <br />
              Create one to get started.
            </div>
          )}
        </aside>
        <section className="note-editor" aria-label="Note editor">
          {selected ? (
            <>
              <div className="editor-status" role="status">
                {saveState === "saving"
                  ? "Saving…"
                  : saveState === "error"
                    ? "Save failed"
                    : "Saved automatically"}
              </div>
              <label className="sr-only" htmlFor="note-title">
                Note title
              </label>
              <input
                id="note-title"
                className="note-title-input"
                value={selected.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Untitled note"
              />
              <label className="sr-only" htmlFor="note-content">
                Note content
              </label>
              <textarea
                id="note-content"
                className="note-content-input"
                value={selected.content}
                onChange={(event) => update("content", event.target.value)}
                placeholder="Start writing…"
              />
            </>
          ) : (
            <div className="editor-placeholder">
              <span className="empty-symbol">✎</span>
              <h2>Make space for a thought.</h2>
              <p>Choose a note or create a new one to begin.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
