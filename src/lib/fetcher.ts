/**
 * Resilient fetch utility with exponential backoff retries and SWR in-memory caching.
 * Prevents temporary server or database hiccups from wiping out valid UI storefront data.
 */

const memoryCache = new Map<string, unknown>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<T | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout per attempt

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
    }

    if (attempt < maxRetries - 1) {
      const backoff = 250 * Math.pow(2, attempt); // 250ms, 500ms, 1000ms
      await delay(backoff);
    }
  }

  console.warn(`[fetchWithRetry] All ${maxRetries} retries failed for ${url}:`, lastError?.message);

  // Return stale cached data if available to prevent UI elements from disappearing
  if (memoryCache.has(url)) {
    return memoryCache.get(url) as T;
  }

  return null;
}
