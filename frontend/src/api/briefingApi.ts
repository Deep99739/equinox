import { apiFetch } from './apiClient';
/**
 * Morning Briefing API Client
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface BriefingResponse {
    greeting: string;
    sleep_score: number;
    critical_emails: number;
    schedule_updated: boolean;
    tasks_count: number;
    summary: string;
}

export interface EmailResponse {
    success: boolean;
    message: string;
}

export const generateBriefing = async (email: string): Promise<BriefingResponse> => {
    const response = await apiFetch(`${API_URL}/api/briefing/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate briefing');
    }

    return response.json();
};

export const sendBriefingEmail = async (email: string): Promise<EmailResponse> => {
    const response = await apiFetch(`${API_URL}/api/briefing/send-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        throw new Error('Failed to send briefing email');
    }

    return response.json();
};
