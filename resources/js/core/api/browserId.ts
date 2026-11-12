// The `X-Browser-Id` header value: a stable, random id for this install (final audit R-31).
//
// The Laravel side (`IchavaSessionManager::getBrowserId`) reads the header to tell browsers
// apart when it keys session-backed favourites, collections, history and preferences. The id
// used to be a fingerprint of the user agent, screen and timezone with the day number appended,
// so it changed every day at midnight UTC and the server-side data keyed on it was orphaned
// daily, while the fingerprint itself was guessable from the same request's headers.
//
// It is now generated once with `crypto.randomUUID()` (or `getRandomValues` where that is
// missing), kept in localStorage under BROWSER_ID_KEY, and reused on every later call and
// visit. Where storage is unavailable (private mode, blocked site data, SSR) the id lives in
// memory for the session instead. Clearing site data is the only thing that changes it.

/** localStorage key holding the id. Namespaced, like the store's own `ichava.browser.v2`. */
export const BROWSER_ID_KEY = 'ichava.browser-id';

const PREFIX = 'ichava_';
const SHAPE = /^ichava_[0-9a-f]{32}$/;

let cached: string | null = null;

function randomHex32(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID().replace(/-/g, '');
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(bytes);
  } else {
    // No Web Crypto at all (very old runtime): the id still only has to be unique, not secret.
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** The stable per-install browser id sent as `X-Browser-Id`. */
export function getBrowserId(): string {
  if (cached) return cached;
  const ls = storage();
  try {
    const stored = ls?.getItem(BROWSER_ID_KEY);
    if (stored && SHAPE.test(stored)) {
      cached = stored;
      return cached;
    }
  } catch {
    // Reading can throw when site data is blocked; fall through to a fresh id.
  }
  cached = `${PREFIX}${randomHex32()}`;
  try {
    ls?.setItem(BROWSER_ID_KEY, cached);
  } catch {
    // Quota or blocked storage: keep the in-memory id for this session.
  }
  return cached;
}

/** Test seam: drop the in-memory copy so the next call reads storage again. */
export function __resetBrowserId(): void {
  cached = null;
}
