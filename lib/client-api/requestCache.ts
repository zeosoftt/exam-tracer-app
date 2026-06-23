/**
 * Kısa süreli GET önbelleği ve eşzamanlı istek birleştirme (deneme sayfası TBT/LCP).
 */

import { fetchJson, type JsonFetchResult } from '@/lib/client-api/http';

type CacheEntry<T> = {
  expiresAt: number;
  value: JsonFetchResult<T>;
};

const getCache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<JsonFetchResult<unknown>>>();

const DEFAULT_TTL_MS = 30_000;

function cacheKey(method: string, url: string): string {
  return `${method}:${url}`;
}

export function invalidateRequestCache(urlPrefix?: string): void {
  if (!urlPrefix) {
    getCache.clear();
    return;
  }
  for (const key of getCache.keys()) {
    if (key.includes(urlPrefix)) getCache.delete(key);
  }
}

export async function fetchJsonCached<T>(
  url: string,
  init?: RequestInit,
  ttlMs = DEFAULT_TTL_MS,
): Promise<JsonFetchResult<T>> {
  const method = init?.method ?? 'GET';
  const key = cacheKey(method, url);
  const now = Date.now();

  const cached = getCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value as JsonFetchResult<T>;
  }

  const existingInflight = inflight.get(key);
  if (existingInflight) {
    return existingInflight as Promise<JsonFetchResult<T>>;
  }

  const promise = fetchJson<T>(url, init)
    .then((result) => {
      getCache.set(key, { expiresAt: Date.now() + ttlMs, value: result as JsonFetchResult<unknown> });
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise as Promise<JsonFetchResult<unknown>>);
  return promise;
}
