export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    return fetch(input, { ...init, credentials: 'include' });
}
