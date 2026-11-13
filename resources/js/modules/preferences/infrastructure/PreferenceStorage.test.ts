import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A6-gaps G24: the command palette's recents and the boot splash's prefs wrote raw
 * localStorage, bypassing the storage driver the user chose in Settings. They go through
 * PreferenceStorage now: the active driver, with the old localStorage copy still read.
 */
async function fresh(driver: 'local' | 'session') {
  vi.resetModules();
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('ichava.browser.driver', driver);
  const [{ PreferenceStorage }, storage] = await Promise.all([import('./PreferenceStorage'), import('@/core/storage')]);
  return { PreferenceStorage, storage };
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('PreferenceStorage', () => {
  it('writes to the active driver: sessionStorage when the user chose session', async () => {
    const { PreferenceStorage } = await fresh('session');
    const recents = new PreferenceStorage<string[]>('ichava.palette.recent');
    recents.write(['theme', 'settings']);
    expect(sessionStorage.getItem('ichava.palette.recent')).toBe('["theme","settings"]');
    expect(localStorage.getItem('ichava.palette.recent')).toBeNull();
    expect(recents.read()).toEqual(['theme', 'settings']);
  });

  it('reads only the active driver: a value left in localStorage by an older build is not read', async () => {
    localStorage.setItem('ichava.palette.recent', '["old"]');
    vi.resetModules();
    localStorage.setItem('ichava.browser.driver', 'session');
    const { PreferenceStorage } = await import('./PreferenceStorage');
    expect(new PreferenceStorage<string[]>('ichava.palette.recent').read()).toBeUndefined();
  });

  it('moves its key with the persisted state when the driver is switched', async () => {
    const { PreferenceStorage, storage } = await fresh('local');
    new PreferenceStorage<string[]>('ichava.palette.recent').write(['a']);
    storage.switchDriver('session');
    expect(sessionStorage.getItem('ichava.palette.recent')).toBe('["a"]');
    expect(localStorage.getItem('ichava.palette.recent')).toBeNull();
  });

  it('answers undefined for a missing or unreadable value, and never throws', async () => {
    const { PreferenceStorage } = await fresh('local');
    localStorage.setItem('bad', '{not json');
    expect(new PreferenceStorage('missing').read()).toBeUndefined();
    expect(new PreferenceStorage('bad').read()).toBeUndefined();
  });
});
