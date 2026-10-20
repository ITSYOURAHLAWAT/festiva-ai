/**
 * Hash-based localStorage cache for AI requests.
 * Identical parameters return in 0ms without wasting API tokens.
 */

const CACHE_PREFIX = 'festiva_ai_';
const CACHE_VERSION = 'v1';
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

function hashObject(obj: unknown): string {
  const str = JSON.stringify(obj, Object.keys((obj || {}) as Record<string, unknown>).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash).toString(36);
}

export function getCacheKey(context: unknown): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${hashObject(context)}`;
}

export function getCachedPlan<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }
    if (Date.now() - entry.timestamp > MAX_CACHE_AGE_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedPlan<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    clearOldCacheEntries();
  }
}

function clearOldCacheEntries(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore storage clear errors
  }
}
