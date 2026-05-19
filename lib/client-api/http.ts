/**
 * Paylaşılan istemci HTTP yardımcıları — fetch + JSON parse tekrarını keser (DRY).
 */

export type JsonFetchResult<T> = {
  ok: boolean;
  status: number;
  body: T;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: { message?: string; code?: string };
  message?: string;
};

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export async function parseJsonSafe<T = unknown>(response: Response): Promise<T> {
  return response.json().catch(() => ({} as T));
}

export async function fetchJson<T = unknown>(
  url: string,
  init?: RequestInit,
): Promise<JsonFetchResult<T>> {
  const response = await fetch(url, init);
  const body = await parseJsonSafe<T>(response);
  return { ok: response.ok, status: response.status, body };
}

export async function fetchApiData<T>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message?: string }> {
  const { ok, status, body } = await fetchJson<ApiEnvelope<T>>(url, init);
  if (ok && body.success && body.data !== undefined) {
    return { ok: true, data: body.data };
  }
  return { ok: false, status, message: body.error?.message ?? body.message };
}

export async function mutateApi<TBody, TData>(
  url: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  body?: TBody,
): Promise<{ ok: boolean; status: number; data?: TData; result: ApiEnvelope<TData> }> {
  const { ok, status, body: result } = await fetchJson<ApiEnvelope<TData>>(url, {
    method,
    headers: JSON_HEADERS,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const success = Boolean(ok && result.success);
  return { ok: success, status, data: result.data, result };
}

export function jsonInit(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: JSON_HEADERS,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };
}

export function getApiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') {
    return fallback;
  }
  const envelope = body as ApiEnvelope<unknown> & { error?: string | { message?: string } };
  if (typeof envelope.error === 'object' && envelope.error?.message) {
    return envelope.error.message;
  }
  if (typeof envelope.error === 'string') {
    return envelope.error;
  }
  return envelope.message ?? fallback;
}
