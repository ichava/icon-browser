// Driver-aware persist storage (plan Part B — real Local/Session driver). The
// driver choice is held in a SEPARATE localStorage key read synchronously before
// hydration; switching copies the persisted blob between backends so nothing is
// lost. All access is guarded because localStorage genuinely throws in private
// mode and is absent under SSR.

import { createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { CONFIG_DEFAULTS } from './config';

export type StorageDriver = 'local' | 'session';

const DRIVER_KEY = CONFIG_DEFAULTS.storageKeys.driver; // 'ichava.browser.driver'
export const PERSIST_KEY = CONFIG_DEFAULTS.storageKeys.persist; // 'ichava.browser.v2'

function ls(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function ss(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

// bootstrapped once from the separate (always-local) driver key; falls back to the
// configured default (`config.storage.frontendDriver`) when the user hasn't chosen.
let driver: StorageDriver = ((): StorageDriver => {
  const v = ls()?.getItem(DRIVER_KEY);
  if (v === 'session' || v === 'local') return v;
  return CONFIG_DEFAULTS.storage.frontendDriver === 'session' ? 'session' : 'local';
})();

function backing(): Storage | null {
  return driver === 'session' ? ss() : ls();
}

/** Keys stored through `PreferenceStorage`, moved by `switchDriver` with the persisted state. */
const preferenceKeys = new Set<string>();

/** Register a preference key so a driver switch carries it. */
export function registerPreferenceKey(key: string): void {
  preferenceKeys.add(key);
}

/** The storage the active driver writes to: sessionStorage or localStorage, or null. */
export function activeStorage(): Storage | null {
  return backing();
}

/**
 * Whether `key` holds persisted state in the active driver right now. Call it before the
 * persist middleware is created: rehydration itself writes, so it answers true afterwards.
 * This is what first-run detection reads, per mount (behaviour change 2).
 */
export function hasPersisted(key: string): boolean {
  try {
    return backing()?.getItem(key) != null;
  } catch {
    return false;
  }
}

/** Current persistence driver. */
export function getDriver(): StorageDriver {
  return driver;
}

/**
 * Switch the persistence driver, migrating the existing blob so state survives.
 * The driver choice itself always lives in localStorage (session would vanish on
 * tab close, defeating persistence-of-choice).
 */
export function switchDriver(next: StorageDriver): void {
  if (next === driver) return;
  const from = driver === 'session' ? ss() : ls();
  const to = next === 'session' ? ss() : ls();
  // The persisted state, and every preference key registered through PreferenceStorage
  // (the palette's recents, the boot splash's prefs), move together (A6-gaps G24).
  for (const key of [PERSIST_KEY, ...preferenceKeys]) {
    try {
      const blob = from?.getItem(key);
      if (blob != null && to) {
        to.setItem(key, blob);
        from?.removeItem(key);
      }
    } catch {
      /* storage unavailable */
    }
  }
  driver = next;
  try {
    ls()?.setItem(DRIVER_KEY, next);
  } catch {
    /* ignore */
  }
}

/** Wipe the persisted snapshot from the active backend. */
export function clearPersisted(): void {
  try {
    backing()?.removeItem(PERSIST_KEY);
  } catch {
    /* ignore */
  }
}

// A StateStorage whose closures read `driver` live, so every write follows the
// currently-selected backend without recreating the persist middleware.
const liveStorage: StateStorage = {
  getItem: (name) => backing()?.getItem(name) ?? null,
  setItem: (name, value) => {
    try {
      backing()?.setItem(name, value);
    } catch {
      /* quota / private mode */
    }
  },
  removeItem: (name) => {
    try {
      backing()?.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const driverStorage = createJSONStorage(() => liveStorage);
