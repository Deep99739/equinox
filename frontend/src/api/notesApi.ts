import { apiFetch } from './apiClient';
// src/api/notesApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchNotes(user_email: string) {
  const res = await apiFetch(`${API_URL}/notes/${user_email}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch notes: ${res.status}`);
  }
  return res.json();
}

export async function addNote(note: { user_email: string; title: string; content: string; source: string }) {
  const res = await apiFetch(`${API_URL}/notes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Server error:', errorText);
    throw new Error(`Failed to add note: ${res.status}`);
  }
  return res.json();
}

export async function updateNote(noteId: string, updates: { title?: string; content?: string }) {
  const res = await apiFetch(`${API_URL}/notes/${noteId}`, {
    method: 'PATCH',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    throw new Error(`Failed to update note: ${res.status}`);
  }
  return res.json();
}

export async function deleteNote(noteId: string) {
  const res = await apiFetch(`${API_URL}/notes/${noteId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete note: ${res.status}`);
  }
}
