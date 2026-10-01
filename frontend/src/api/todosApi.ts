import { apiFetch } from './apiClient';
// src/api/todosApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Todo {
    id: string;
    user_email: string;
    text: string;
    completed: boolean;
    due_date?: string;
    created_at?: string;
}

export async function fetchTodos(user_email: string): Promise<Todo[]> {
    const res = await apiFetch(`${API_URL}/todos/${user_email}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch todos: ${res.status}`);
    }
    return res.json();
}

export async function addTodo(todo: { user_email: string; text: string; due_date?: string }): Promise<Todo> {
    const res = await apiFetch(`${API_URL}/todos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to add todo: ${res.status}`);
    }
    return res.json();
}

export async function updateTodo(todoId: string, updates: { text?: string; completed?: boolean; due_date?: string }, user_email?: string): Promise<Todo> {
    let url = `${API_URL}/todos/${todoId}`;
    if (user_email) {
        url += `?user_email=${encodeURIComponent(user_email)}`;
    }
    const res = await apiFetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!res.ok) {
        throw new Error(`Failed to update todo: ${res.status}`);
    }
    return res.json();
}

export async function deleteTodo(todoId: string, user_email?: string): Promise<void> {
    let url = `${API_URL}/todos/${todoId}`;
    if (user_email) {
        url += `?user_email=${encodeURIComponent(user_email)}`;
    }
    const res = await apiFetch(url, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error(`Failed to delete todo: ${res.status}`);
    }
}
