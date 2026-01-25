// api/chatApi.ts
export async function sendChatMessage(message: string, port: string = '8000'): Promise<any> {
    const res = await fetch(`http://localhost:${port}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }
    return res.json();
}
