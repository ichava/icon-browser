import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BROWSER_ID_KEY, getBrowserId, __resetBrowserId } from './browserId';

/** R-31: X-Browser-Id is a stable per-install id, not a fingerprint that rotates daily. */
describe('getBrowserId', () => {
  beforeEach(() => {
    window.localStorage.clear();
    __resetBrowserId();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.localStorage.clear();
    __resetBrowserId();
  });

  it('is a random id, generated once and persisted under a namespaced key', () => {
    const id = getBrowserId();
    expect(id).toMatch(/^ichava_[0-9a-f]{32}$/);
    expect(window.localStorage.getItem(BROWSER_ID_KEY)).toBe(id);
    expect(BROWSER_ID_KEY.startsWith('ichava.')).toBe(true);
  });

  it('is the same on every call and after a reload', () => {
    const first = getBrowserId();
    expect(getBrowserId()).toBe(first);
    __resetBrowserId(); // a new page load: only storage survives
    expect(getBrowserId()).toBe(first);
  });

  it('does not change when the day changes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T23:59:00Z'));
    const today = getBrowserId();
    vi.setSystemTime(new Date('2026-11-04T00:01:00Z'));
    __resetBrowserId();
    expect(getBrowserId()).toBe(today);
  });

  it('is regenerated only when storage is cleared', () => {
    const first = getBrowserId();
    __resetBrowserId();
    expect(getBrowserId()).toBe(first);
    window.localStorage.removeItem(BROWSER_ID_KEY);
    __resetBrowserId();
    const second = getBrowserId();
    expect(second).not.toBe(first);
    expect(second).toMatch(/^ichava_[0-9a-f]{32}$/);
  });

  it('replaces a stored value that is not an id', () => {
    window.localStorage.setItem(BROWSER_ID_KEY, 'ichava_0badc0de_4e2');
    const id = getBrowserId();
    expect(id).not.toBe('ichava_0badc0de_4e2');
    expect(window.localStorage.getItem(BROWSER_ID_KEY)).toBe(id);
  });

  it('keeps an in-memory id for the session when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const id = getBrowserId();
    expect(id).toMatch(/^ichava_[0-9a-f]{32}$/);
    expect(getBrowserId()).toBe(id);
  });

  it('falls back to getRandomValues when randomUUID is missing', () => {
    const c = globalThis.crypto;
    const own = Object.getOwnPropertyDescriptor(c, 'randomUUID');
    Object.defineProperty(c, 'randomUUID', { value: undefined, configurable: true });
    try {
      const values = vi.spyOn(c, 'getRandomValues');
      expect(getBrowserId()).toMatch(/^ichava_[0-9a-f]{32}$/);
      expect(values).toHaveBeenCalled();
    } finally {
      if (own) Object.defineProperty(c, 'randomUUID', own);
      else delete (c as { randomUUID?: unknown }).randomUUID;
    }
  });
});
