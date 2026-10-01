import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchNotes, addNote, updateNote, deleteNote } from '../../api/notesApi';
import { Trash2 } from 'lucide-react';
import './NotesPage.css';
import SignedInNavbar from '../../components/Navbar/SignedInNavbar';
import { getUserEmail, signOut } from '../../utils/authUtils';

interface Note {
    id: string;
    user_email: string;
    title: string;
    content: string;
    source: string;
    created_at?: string;
    updated_at?: string;
}

export default function NotesPage() {
    const user_email = getUserEmail();
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(Boolean(user_email));
    const [error, setError] = useState<string | null>(user_email ? null : 'No user email found');
    const saveTimeoutRef = useRef<number | null>(null);
    const pendingSaveRef = useRef<{ id: string; updates: { title?: string; content?: string } } | null>(null);

    const handleSignOut = () => {
        void signOut();
    };

    // Fetch notes on mount
    useEffect(() => {
        if (!user_email) return;

        fetchNotes(user_email)
            .then(data => {
                setNotes(data);
                if (data.length > 0) setSelectedNoteId(data[0].id);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch notes:', err);
                setError('Failed to load notes');
                setIsLoading(false);
            });
    }, [user_email]);

    const selectedNote = notes.find(n => n.id === selectedNoteId);

    const saveNote = useCallback(async (noteId: string, updates: { title?: string; content?: string }) => {
        try {
            await updateNote(noteId, updates);
        } catch (err) {
            console.error('Failed to save note:', err);
            setError('Failed to save changes');
        }
    }, []);

    const flushPendingSave = useCallback(() => {
        if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        const pending = pendingSaveRef.current;
        pendingSaveRef.current = null;
        if (pending) void saveNote(pending.id, pending.updates);
    }, [saveNote]);

    const handleNewNote = async () => {
        flushPendingSave();
        try {
            const newNote = await addNote({
                user_email,
                title: '',
                content: '',
                source: 'user',
            });
            setNotes(prev => [newNote, ...prev]);
            setSelectedNoteId(newNote.id);
        } catch (err) {
            console.error('Failed to create note:', err);
            setError('Failed to create note');
        }
    };

    const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        if (pendingSaveRef.current?.id === noteId) {
            pendingSaveRef.current = null;
            if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        } else {
            flushPendingSave();
        }

        try {
            await deleteNote(noteId);
            const updatedNotes = notes.filter(n => n.id !== noteId);
            setNotes(updatedNotes);
            if (selectedNoteId === noteId) {
                setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
            }
        } catch (err) {
            console.error('Failed to delete note:', err);
            setError('Failed to delete note');
        }
    };

    const updateSelectedNote = (field: 'title' | 'content', value: string) => {
        if (!selectedNoteId) return;

        setNotes(prev => prev.map(n =>
            n.id === selectedNoteId ? { ...n, [field]: value } : n
        ));

        if (pendingSaveRef.current && pendingSaveRef.current.id !== selectedNoteId) {
            flushPendingSave();
        }
        pendingSaveRef.current = {
            id: selectedNoteId,
            updates: { ...(pendingSaveRef.current?.updates ?? {}), [field]: value },
        };
        if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = window.setTimeout(flushPendingSave, 500);
    };

    useEffect(() => {
        return () => flushPendingSave();
    }, [flushPendingSave]);

    if (isLoading) {
        return (
            <>
                <SignedInNavbar onSignOut={handleSignOut} />
                <div className="notes-app">
                    <div className="loading">Loading notes...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <SignedInNavbar onSignOut={handleSignOut} />
            <div className="notes-app">
                {error && (
                    <div className="error-banner" onClick={() => setError(null)}>
                        {error} (click to dismiss)
                    </div>
                )}
                <div className="notes-layout">
                    <aside className="notes-sidebar">
                        {notes.length === 0 && <div className="empty">No Notes</div>}
                        {notes.map(note => (
                            <div
                                key={note.id}
                                className={`note-item ${note.id === selectedNoteId ? 'active' : ''}`}
                                onClick={() => {
                                    flushPendingSave();
                                    setSelectedNoteId(note.id);
                                }}
                            >
                                <div className="note-header-row">
                                    <div className="note-title">{note.title || 'Untitled'}</div>
                                    <button
                                        className="delete-note-btn"
                                        onClick={(e) => handleDeleteNote(e, note.id)}
                                        title="Delete note"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="note-preview">
                                    {note.content?.slice(0, 40) || 'No content'}
                                </div>
                            </div>
                        ))}
                        <div className="new-button">
                            <button onClick={handleNewNote}>＋ New Note</button>
                        </div>
                    </aside>

                    <main className="notes-editor">
                        {selectedNote ? (
                            <>
                                <input
                                    className="editor-title"
                                    value={selectedNote.title}
                                    onChange={e => updateSelectedNote('title', e.target.value)}
                                    placeholder="Note title"
                                />
                                <textarea
                                    className="editor-content"
                                    value={selectedNote.content}
                                    onChange={e => updateSelectedNote('content', e.target.value)}
                                    placeholder="Start typing..."
                                />
                            </>
                        ) : (
                            <div className="editor-empty">Select or create a note</div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
