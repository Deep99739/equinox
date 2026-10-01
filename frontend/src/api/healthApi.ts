import { apiFetch } from './apiClient';
// src/api/healthApi.ts
// API client for wellness agent health logging

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/health`;

export interface HealthLogInput {
    user_email?: string;
    sleep_hours: number;
    sleep_quality: number;
    energy_level: number;
    stress_level: number;
    mood_score: number;
    activity_minutes?: number;
    steps?: number;
    water_glasses?: number;
    caffeine_cups?: number;
    notes?: string;
}

export interface HealthLogResponse {
    id: string;
    user_id: string;
    date: string;
    sleep_hours: number;
    sleep_quality: number;
    energy_level: number;
    stress_level: number;
    mood_score: number;
    activity_minutes: number;
    steps: number;
    water_glasses: number;
    caffeine_cups: number;
    readiness_score: number | null;
    notes: string | null;
}

export interface ReadinessResponse {
    score: number;
    zone: string;
    sleep_factor: number;
    energy_factor: number;
    stress_factor: number;
    activity_factor: number;
    consistency_factor: number;
    summary: string;
    suggestions: string[];
}

export async function logHealth(data: HealthLogInput): Promise<HealthLogResponse> {
    const res = await apiFetch(`${API_BASE}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to log health: ${res.status}`);
    }
    return res.json();
}

export async function getTodayHealth(user_email?: string): Promise<HealthLogResponse | null> {
    let url = `${API_BASE}/today`;
    if (user_email) {
        url += `?user_email=${encodeURIComponent(user_email)}`;
    }
    const res = await apiFetch(url);
    if (res.status === 404) {
        return null; // no log yet
    }
    if (!res.ok) {
        throw new Error(`Failed to get today's health: ${res.status}`);
    }
    return res.json();
}

export async function getReadiness(user_email?: string): Promise<ReadinessResponse | null> {
    let url = `${API_BASE}/readiness`;
    if (user_email) {
        url += `?user_email=${encodeURIComponent(user_email)}`;
    }
    const res = await apiFetch(url);
    if (res.status === 404) {
        return null;
    }
    if (!res.ok) {
        throw new Error(`Failed to get readiness: ${res.status}`);
    }
    return res.json();
}

export async function getHealthHistory(days: number = 7): Promise<HealthLogResponse[]> {
    const res = await apiFetch(`${API_BASE}/history?days=${days}`);
    if (!res.ok) {
        throw new Error(`Failed to get health history: ${res.status}`);
    }
    return res.json();
}
