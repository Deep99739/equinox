import { apiFetch } from './apiClient';
// chat api - supports multiple agents
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type AgentType = 'wellness' | 'productivity' | 'supervisor';
export interface ChatMessage { text: string; sender: string; id: number }
export interface ChatReply { response?: string; summary?: string; reply?: string; thread_id?: string }
export interface SavedThread { messages: ChatMessage[]; title: string }

export async function sendChatMessage(
    message: string,
    agent: AgentType = 'supervisor',
    email?: string | null,
    threadId?: string | null
): Promise<ChatReply> {
    // each agent has its own endpoint
    const endpoints: Record<AgentType, string> = {
        wellness: '/api/chat/wellness',
        productivity: '/supervisor',
        supervisor: '/supervisor'
    };

    const endpoint = endpoints[agent];

    const res = await apiFetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, email, thread_id: threadId })
    });

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }

    return res.json();
}

export async function saveThread(
    email: string,
    threadId: string,
    messages: ChatMessage[],
    title: string = "New Conversation"
): Promise<{ status: string; thread_id: string }> {
    const res = await apiFetch(`${API_URL}/api/history/${email}/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages,
            title
        })
    });

    if (!res.ok) {
        throw new Error(`Failed to save thread: ${res.status}`);
    }
    return res.json();
}

export async function getThread(
    email: string,
    threadId: string
): Promise<SavedThread> {
    const res = await apiFetch(`${API_URL}/api/history/${email}/${threadId}`);
    if (!res.ok) {
        throw new Error('Thread not found');
    }
    return res.json();
}
