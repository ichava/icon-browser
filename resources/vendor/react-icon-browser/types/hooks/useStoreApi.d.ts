import { type BrowserStoreHook } from '../store';
export declare const StoreProvider: import("react").Provider<import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<import("../store").BrowserStore>, "persist" | "setState"> & {
    setState(partial: import("../store").BrowserStore | Partial<import("../store").BrowserStore> | ((state: import("../store").BrowserStore) => import("../store").BrowserStore | Partial<import("../store").BrowserStore>), replace?: false | undefined): unknown;
    setState(state: import("../store").BrowserStore | ((state: import("../store").BrowserStore) => import("../store").BrowserStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<import("../store").BrowserStore, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: import("../store").BrowserStore) => void) => () => void;
        onFinishHydration: (fn: (state: import("../store").BrowserStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<import("../store").BrowserStore, unknown, unknown>>;
    };
}> | null>;
/**
 * The active store instance for this part of the tree.
 *
 * Use this in place of importing `useStore` directly whenever you need the store
 * OBJECT rather than a selected value — `getState()`, `setState()`, `subscribe()`.
 * Those are statics on the singleton and cannot be context-aware on their own, so
 * reaching for them through the import is what breaks a second mount.
 *
 * ```ts
 * const store = useStoreApi();
 * store.getState().openDetail(id);
 * ```
 */
export declare function useStoreApi(): BrowserStoreHook;
/**
 * Select a value from the active store.
 *
 * The context-aware replacement for calling the imported `useStore` directly. A
 * zustand bound store IS a hook, so this just resolves which one first; the store
 * identity is stable per mount, so the hook order is stable too.
 *
 * ```ts
 * const theme = useAppStore((s) => s.theme);
 * ```
 */
export declare function useAppStore<T>(selector: (s: ReturnType<BrowserStoreHook['getState']>) => T): T;
