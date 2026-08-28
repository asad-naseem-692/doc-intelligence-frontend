import { authStorage } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers = {}, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += `?${qs}`;
    }
  }

  const token = authStorage.getToken();
  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(rest.body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
  });

  if (response.status === 401) {
    authStorage.clear();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired or unauthorized. Please log in again.');
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  // If response has no content (e.g. 204 or empty response)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return {} as T;
}
