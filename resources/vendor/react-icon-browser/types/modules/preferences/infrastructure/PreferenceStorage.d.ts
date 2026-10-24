/**
 * One preference under its own key, stored through the driver the user chose in Settings
 * (A6-gaps G24). The command palette's recents and the boot splash's prefs wrote raw
 * localStorage, so choosing session storage left them behind. Reads fall back to the
 * localStorage copy written before, so nothing a user had is lost; a driver switch moves
 * the key with the rest of the persisted state. Every access is guarded: storage throws
 * in private mode and is absent under SSR.
 */
export declare class PreferenceStorage<T> {
    #private;
    constructor(key: string);
    get key(): string;
    /** The stored value, or undefined when missing or unreadable. */
    read(): T | undefined;
    write(value: T): void;
}
