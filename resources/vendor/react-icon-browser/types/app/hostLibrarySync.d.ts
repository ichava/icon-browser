import type { StoreApi } from 'zustand';
import { type LibraryOp, type RemoteLibrary } from '../modules/library';
import type { DevBus } from '../modules/telemetry';
import type { HostPreferences } from '../modules/preferences';
import type { BrowserStore } from '../state/types';
/** The two calls the sync needs, so a test can stand in for the server. */
export interface LibraryGateway {
    load(): Promise<RemoteLibrary>;
    apply(op: LibraryOp): Promise<{
        from: string;
        to: string;
    } | void>;
}
/**
 * Start syncing. Returns the stop function. `ready` settles once the first load has
 * been written to the store (or has failed).
 */
export declare function startLibrarySync(store: StoreApi<BrowserStore>, gateway: LibraryGateway, bus?: DevBus): {
    stop: () => void;
    ready: Promise<void>;
    idle: () => Promise<void>;
};
/** The preference calls the sync needs. */
export interface PreferenceGateway {
    load(): Promise<HostPreferences>;
    save(p: HostPreferences): Promise<void>;
}
/**
 * A REST host's preferences for this user: the view, icon size, page size and sort.
 * Loaded once and applied, then saved after each change settles (`delayMs`), so a
 * slider drag is one request rather than one per step.
 */
export declare function startPreferenceSync(store: StoreApi<BrowserStore>, gateway: PreferenceGateway, delayMs?: number): {
    stop: () => void;
    ready: Promise<void>;
    flush: () => Promise<void>;
};
