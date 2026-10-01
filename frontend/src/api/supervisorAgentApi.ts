import { apiFetch } from './apiClient';
// api/supervisorAgentApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function simulateFatigue(fatigueLevel: number): Promise<{ reply: string }> {
    const res = await apiFetch(`${API_URL}/supervisor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: `I feel ${fatigueLevel}/10 fatigue today. What should I do based on my logged wellness data?`
        }),
    });
    if (!res.ok) throw new Error(`Supervisor request failed: ${res.status}`);
    return res.json();
}
