import { describe, it, expect, beforeEach } from 'vitest';
import { getCacheKey, getCachedPlan, setCachedPlan } from '@/services/cache';

const storageMap = new Map<string, string>();

const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  get length() {
    return storageMap.size;
  },
  key: (index: number) => Array.from(storageMap.keys())[index] || null,
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Cache Service', () => {
  beforeEach(() => {
    storageMap.clear();
  });

  it('generates deterministic cache keys invariant to property order', () => {
    const inputA = { eventType: 'wedding', budget: 500000, city: 'Jaipur' };
    const inputB = { city: 'Jaipur', budget: 500000, eventType: 'wedding' };

    const keyA = getCacheKey(inputA);
    const keyB = getCacheKey(inputB);

    expect(keyA).toBe(keyB);
    expect(keyA).toContain('festiva_ai_v1_');
  });

  it('stores and retrieves cache entries with fidelity', () => {
    const key = 'festiva_test_entry';
    const payload = { test: true, name: 'Royal Celebration' };

    setCachedPlan(key, payload);
    const retrieved = getCachedPlan<typeof payload>(key);

    expect(retrieved).toEqual(payload);
  });

  it('returns null for nonexistent keys', () => {
    const result = getCachedPlan('nonexistent_key_123');
    expect(result).toBeNull();
  });
});
