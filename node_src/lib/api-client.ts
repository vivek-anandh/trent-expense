import { mockGet, mockPost } from '@/lib/mock-data';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';
const IS_PROD = (process.env.NEXT_PUBLIC_PROD_MODE ?? 'Y') === 'Y';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function createApiClient(accessToken: string | undefined) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!IS_PROD) {
      return mockRequest<T>(path, init);
    }

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

function mockRequest<T>(path: string, init?: RequestInit): T {
  const method = init?.method ?? 'GET';
  const body = init?.body ? JSON.parse(init.body as string) : undefined;

  if (method === 'GET') {
    return mockGet(path) as T;
  }
  if (method === 'POST') {
    return mockPost(path, body) as T;
  }
  throw new ApiError(405, `Mock: ${method} ${path} not implemented`);
}
