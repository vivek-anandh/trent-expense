const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Thin fetch wrapper bound to the current OIDC access token.
 * Get an instance via `useApiClient()` inside components — don't call
 * `fetch` directly from components/hooks elsewhere.
 */
export function createApiClient(accessToken: string | undefined) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(API_KEY ? { 'X-API-KEY': API_KEY } : {}),
        ...init?.headers,
      },
    });

    if (!res.ok) {
      throw new ApiError(res.status, `${init?.method ?? 'GET'} ${path} failed (${res.status})`);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  };
}
