/**
 * Resilient fetch utility with exponential backoff retries and in-memory caching.
 * Prevents temporary server or database hiccups from wiping out valid UI storefront data.
 *
 * Timeout: 10s per attempt (generous for slow hosting but not infinite)
 * Retries: 2 attempts total (1 retry) for fast feedback
 * Cache: Returns stale cached data if all retries fail (graceful degradation)
 */

const memoryCache = new Map<string, unknown>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries = 2
): Promise<T | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      // 10s timeout per attempt — generous for slow hosting but not infinite
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) {
          memoryCache.set(url, data);
          return data as T;
        }
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Don't retry on non-timeout errors (e.g. network offline) — fail fast
      if (lastError.name !== 'AbortError') break;
    }

    if (attempt < maxRetries - 1) {
      // Shorter backoff: 500ms between retries
      await delay(500);
    }
  }

  console.warn(`[fetchWithRetry] Failed for ${url}:`, lastError?.message);

  // Return stale cached data if available (graceful degradation — don't blank the UI)
  if (memoryCache.has(url)) {
    return memoryCache.get(url) as T;
  }

  return null;
}
