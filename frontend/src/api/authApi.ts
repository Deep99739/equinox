import { apiFetch } from './apiClient';
// api/authApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function handleGoogleSignIn() {
  // Navigate through the backend so the OAuth state cookie is set first party.
  window.location.href = `${API_URL}/auth/google/login`;
}

export async function fetchSession(): Promise<{ email: string }> {
  const res = await apiFetch(`${API_URL}/auth/session`);
  if (!res.ok) throw new Error('No active session');
  return res.json();
}

export async function fetchConnections(): Promise<{ google: boolean }> {
  const res = await apiFetch(`${API_URL}/auth/connections`);
  if (!res.ok) throw new Error('Could not load connection status');
  return res.json();
}

export async function logout(): Promise<void> {
  const res = await apiFetch(`${API_URL}/auth/logout`, { method: 'POST' });
  if (!res.ok) throw new Error('Could not sign out');
}
