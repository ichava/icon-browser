import type { Scale, Density } from './core/types';
import type { ListParams } from './core/api/ApiClient';
import type { AppConfig } from './core/config';
import { type DevBus } from './modules/telemetry';
import { type IdentityProvider } from './modules/identity';
import { type StorageDriver } from './core/storage';
import { type Locale } from './core/i18n';
import type { BrowserStore, FilterState } from './state/types';
export type { Locale };
export type { Scale, Density, AppConfig, StorageDriver };
export type { LibTab, Plan, AuthStatus, AuthView, DevToolsTab, BootPhase, AuthUser, AppNotification, DevToolsEvent, BootStateSlice, SearchScope, Layer, FilterState, BrowserStore, ContextMenuItem, ConfirmSpec, } from './state/types';
export type { Collection, HistoryEntry, TeamRef } from './modules/library';
/** `ListParams` for a filter state: one selected variant becomes a one-item list. */
export declare function toListParams(f: FilterState): ListParams;
export interface CreateStoreOptions {
    /**
     * localStorage key for the persisted slice. Pass a distinct key for a second
     * mount that should keep its own preferences, or `null` to not persist at all.
     *
     * Two stores sharing one key are not independent: they would sync through
     * storage even though they are separate instances.
     */
    persistKey?: string | null;
    /**
     * The bus this store's actions emit on (sign-in, sharing, storage, DevTools). Omit it
     * and the store gets its own child of the page bus, so its events reach its own mount's
     * Events tab and no other. Read it back with `devBusOf(store)`.
     */
    devBus?: DevBus;
    /**
     * Who signs in. Omit it for the frontend-only demo (`DemoIdentity`), which is what the
     * store has always done; a host with real accounts passes its own provider.
     */
    identity?: IdentityProvider;
}
/** The bus a store emits on: its own child of the page bus, or the one it was given. */
export declare function devBusOf(store: object): DevBus | undefined;
/**
 * Build a browser store.
 *
 * Exists so a store can be created PER MOUNT. The module-level `useStore` below is
 * the default instance for the standalone app; two `<IchavaBrowser>` instances on one
 * page each get their own, so they no longer share filters, selection, favorites and
 * theme.
 *
 * Note the creator takes `(set, get)`. It previously took `(set)` alone, which is why
 * five actions reached for `useStore.getState()` -- meaning a per-mount store's own
 * actions would have read and written the singleton rather than themselves. That had
 * to be fixed before per-mount instances could work at all.
 */
export declare function createBrowserStore({ persistKey, devBus, identity }?: CreateStoreOptions): import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<BrowserStore>, "persist" | "setState"> & {
    setState(partial: BrowserStore | Partial<BrowserStore> | ((state: BrowserStore) => BrowserStore | Partial<BrowserStore>), replace?: false | undefined): unknown;
    setState(state: BrowserStore | ((state: BrowserStore) => BrowserStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<BrowserStore, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: BrowserStore) => void) => () => void;
        onFinishHydration: (fn: (state: BrowserStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<BrowserStore, unknown, unknown>>;
    };
}>;
/**
 * The default store instance.
 *
 * Retained as a module singleton for the standalone app and for the 259 call sites
 * that read it directly. A per-mount instance is provided through context instead --
 * see `hooks/useStoreApi`.
 */
export declare const useStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<BrowserStore>, "persist" | "setState"> & {
    setState(partial: BrowserStore | Partial<BrowserStore> | ((state: BrowserStore) => BrowserStore | Partial<BrowserStore>), replace?: false | undefined): unknown;
    setState(state: BrowserStore | ((state: BrowserStore) => BrowserStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<BrowserStore, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: BrowserStore) => void) => () => void;
        onFinishHydration: (fn: (state: BrowserStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<BrowserStore, unknown, unknown>>;
    };
}>;
/** The type of a store instance, for props and context. */
export type BrowserStoreHook = typeof useStore;
