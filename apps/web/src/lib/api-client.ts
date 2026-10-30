import type { ApiResponse } from '@/types/api.types';

/**
 * api-client.ts — Axios-based API client for NestJS backend.
 * Ref: api-standards.md, coding-standards.md
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json as ApiResponse<T>;
}

export const apiClient = {
  get<T>(path: string, headers?: Record<string, string>) {
    return request<T>(path, { method: 'GET', headers });
  },

  post<T>(path: string, body: unknown, headers?: Record<string, string>) {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body), headers });
  },

  patch<T>(path: string, body: unknown, headers?: Record<string, string>) {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body), headers });
  },

  delete<T>(path: string, headers?: Record<string, string>) {
    return request<T>(path, { method: 'DELETE', headers });
  },
};
