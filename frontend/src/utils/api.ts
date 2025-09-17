export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiResponse<T> {
	data: T;
	status: number;
}

function withBaseUrl(path: string): string {
	const base = import.meta.env.VITE_BACKEND_URL as string | undefined;
	if (base && path.startsWith('/')) {
		// Only prefix API routes to avoid breaking external URLs
		if (path.startsWith('/api')) return base.replace(/\/$/, '') + path;
	}
	return path;
}

export async function apiFetch<T>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string, string> } = {}): Promise<ApiResponse<T>> {
	const { method = 'GET', body, headers = {} } = options;
	const token = localStorage.getItem('sads_token');
	const res = await fetch(withBaseUrl(path), {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...headers
		},
		body: body ? JSON.stringify(body) : undefined
	});
	const contentType = res.headers.get('content-type');
	const isJson = contentType && contentType.includes('application/json');
	const json = isJson ? await res.json() : undefined;
	if (!res.ok) {
		const message = (json && (json.message || json.error)) || `Request failed with status ${res.status}`;
		throw new Error(message);
	}
	return { data: json as T, status: res.status };
}
