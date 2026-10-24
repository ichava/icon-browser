import type { Catalog } from '../core/IconRepository';
import type { IconCatalog } from '../core/api/ApiClient';
import type { IchavaBrowserProps } from '../IchavaBrowser';
import type { AppConfig, BrowserStoreHook } from '../store';
import type { Locale } from '../core/i18n';
/**
 * `mountIchavaBrowser`'s options (`MountOptions`), spelled from the component's props so this file does
 * not import `mount.tsx` (which imports it). The port's type check in `browser()` keeps
 * the two in step.
 */
export type BuilderMountOptions = IchavaBrowserProps & {
    persistKey?: string | null;
};
/** A mounted browser. `using handle = browser()...mount(el)` unmounts it at the end of the scope. */
export interface BrowserHandle {
    /** The store this mount reads and writes. */
    readonly store: BrowserStoreHook;
    unmount(): void;
    [Symbol.dispose](): void;
}
/** What the builder needs from the app: the existing mount function and store factory. */
export interface BrowserBuilderPorts {
    mount(el: HTMLElement, options: BuilderMountOptions): {
        unmount(): void;
    };
    createStore(options: {
        persistKey?: string | null;
    }): BrowserStoreHook;
}
interface State {
    readonly catalog?: Catalog;
    readonly client?: IconCatalog;
    readonly config?: AppConfig | null;
    readonly manageDocument?: boolean;
    readonly syncUrl?: boolean;
    readonly urlPrefix?: string;
    readonly store?: BrowserStoreHook;
    /** Absent: the mount path's own default. `null`: memory only. */
    readonly persistKey?: string | null;
    readonly locale?: Locale;
}
/**
 * Immutable: every call returns a new frozen builder, so a half-built one can be reused.
 * A data source is required, and setting one replaces the other: `catalog()` and
 * `rest()` are mutually exclusive, as `catalog` and `client` are on the component.
 */
export declare class BrowserBuilder {
    #private;
    constructor(ports: BrowserBuilderPorts, state?: State);
    /** A pre-loaded static catalog. Replaces any `rest()` client. */
    catalog(catalog: Catalog): BrowserBuilder;
    /** A live data client, e.g. `RestCatalog.at('/admin/ichava/api').csrf('cookie')`. Replaces any `catalog()`. */
    rest(client: IconCatalog): BrowserBuilder;
    config(config: AppConfig | null): BrowserBuilder;
    /** Keep this mount's preferences under its own storage key. */
    persist(key: string): BrowserBuilder;
    /** Keep this mount's preferences in memory only: usually right for a secondary mount. */
    ephemeral(): BrowserBuilder;
    /** Use this store, e.g. to share state deliberately. Overrides `persist()`/`ephemeral()`. */
    store(store: BrowserStoreHook): BrowserBuilder;
    /** The whole page: own the document (`manageDocument`) and the address bar (`syncUrl`). */
    standalone(): BrowserBuilder;
    /** A mount inside a host page, which keeps its document and URL. The default. */
    embedded(): BrowserBuilder;
    /** Mirror filter state into the address bar, optionally under a parameter prefix. */
    syncUrl(prefix?: string): BrowserBuilder;
    /** Open in this language (the host's choice); the user can still switch. Unknown codes throw. */
    locale(locale: Locale): BrowserBuilder;
    /**
     * The `mountIchavaBrowser` options these choices make. A store is passed only when
     * `store()` was called; `persist()`/`ephemeral()` travel as `persistKey`.
     */
    toOptions(): BuilderMountOptions;
    /**
     * Props for `<IchavaBrowser>`. With `persist()` or `ephemeral()` this creates the
     * mount's store, once per builder: build it once (outside render) and reuse it.
     * Without either, no store is passed, and the component uses its own default.
     */
    toProps(): IchavaBrowserProps;
    /** `mountIchavaBrowser(el, options)`, returning the store with the handle. */
    mount(el: HTMLElement): BrowserHandle;
}
export {};
