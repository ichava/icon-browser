import { activeStorage, registerPreferenceKey } from '@/core/storage';

/**
 * One preference under its own key, stored through the driver the user chose in Settings
 * (A6-gaps G24). The command palette's recents and the boot splash's prefs wrote raw
 * localStorage, so choosing session storage left them behind. Reads fall back to the
 * localStorage copy written before, so nothing a user had is lost; a driver switch moves
 * the key with the rest of the persisted state. Every access is guarded: storage throws
 * in private mode and is absent under SSR.
 */
export class PreferenceStorage<T> {
  readonly #key: string;

  constructor(key: string) {
    this.#key = key;
    registerPreferenceKey(key);
    Object.freeze(this);
  }

  get key(): string {
    return this.#key;
  }

  /** The stored value, or undefined when missing or unreadable. */
  read(): T | undefined {
    try {
      const raw = activeStorage()?.getItem(this.#key);
      return raw == null ? undefined : (JSON.parse(raw) as T);
    } catch {
      return undefined; // unreadable or unavailable
    }
  }

  write(value: T): void {
    try {
      activeStorage()?.setItem(this.#key, JSON.stringify(value));
    } catch {
      /* quota or private mode */
    }
  }
}
