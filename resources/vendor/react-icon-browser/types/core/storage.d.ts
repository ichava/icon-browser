export type StorageDriver = 'local' | 'session';
export declare const PERSIST_KEY: string;
/** Register a preference key so a driver switch carries it. */
export declare function registerPreferenceKey(key: string): void;
/** The storage the active driver writes to: sessionStorage or localStorage, or null. */
export declare function activeStorage(): Storage | null;
/** localStorage, where values lived before they followed the driver; null when unavailable. */
export declare function legacyStorage(): Storage | null;
/**
 * Whether `key` holds persisted state in the active driver right now. Call it before the
 * persist middleware is created: rehydration itself writes, so it answers true afterwards.
 * This is what first-run detection reads, per mount (behaviour change 2).
 */
export declare function hasPersisted(key: string): boolean;
/** Current persistence driver. */
export declare function getDriver(): StorageDriver;
/**
 * Switch the persistence driver, migrating the existing blob so state survives.
 * The driver choice itself always lives in localStorage (session would vanish on
 * tab close, defeating persistence-of-choice).
 */
export declare function switchDriver(next: StorageDriver): void;
/** Wipe the persisted snapshot from the active backend. */
export declare function clearPersisted(): void;
export declare const driverStorage: import("zustand/middleware").PersistStorage<unknown, unknown> | undefined;
