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
	
	// Log the request for debugging
	console.log('API Request:', { path: withBaseUrl(path), method, body });
	
	try {
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
		
		let json: any;
		try {
			json = isJson ? await res.json() : undefined;
		} catch (parseError) {
			// If we can't parse JSON, that's an error
			console.error('Failed to parse JSON response:', parseError);
			json = undefined;
		}
		
		// Log the response for debugging
		console.log('API Response:', { status: res.status, statusText: res.statusText, json });
		
		if (!res.ok) {
			const message = (json && (json.message || json.error)) || res.statusText || `Request failed with status ${res.status}`;
			throw new Error(message);
		}
		
		return { data: json as T, status: res.status };
	} catch (error) {
		// Handle network errors gracefully
		if (error instanceof TypeError && error.message.includes('fetch')) {
			console.warn('Network error - backend may not be running:', error);
			throw new Error('Backend server is not available');
		}
		throw error;
	}
}