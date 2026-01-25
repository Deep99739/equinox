// chat api - supports multiple agents

export type AgentType = 'wellness' | 'productivity' | 'supervisor';

export async function sendChatMessage(
    message: string,
    port: string = '8000',
    agent: AgentType = 'wellness'
): Promise<any> {
    // each agent has its own endpoint
    const endpoints: Record<AgentType, string> = {
        wellness: '/api/chat/wellness',
        productivity: '/supervisor',  // abhyajit's endpoint
        supervisor: '/supervisor'
    };

    const endpoint = endpoints[agent] || endpoints.wellness;

    const res = await fetch(`http://localhost:${port}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }

    return res.json();
}
