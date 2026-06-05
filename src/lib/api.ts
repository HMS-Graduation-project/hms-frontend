const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders as Record<string, string>,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  // Automatic silent refresh on 401
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefresh();
    }
    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      // Retry the original request with new cookie
      const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
        headers,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
        ...rest,
      });
      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({ message: retryResponse.statusText }));
        throw new ApiError(retryResponse.status, error.message || 'Request failed');
      }
      return retryResponse.json();
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PUT', body }),
  patch: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PATCH', body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError };
