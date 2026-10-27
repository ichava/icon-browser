import type { AppConfig } from './store';
import type { Catalog } from './modules/catalog';
import type { IconCatalog } from './core/api/ApiClient';
import { type Locale } from './core/i18n';
import type { BrowserStoreHook } from './store';
export interface IchavaBrowserProps {
    /**
     * A pre-loaded static catalog (the standalone demo).
     * Mutually exclusive with `client`; exactly one is required.
     */
    catalog?: Catalog;
    /**
     * An explicit data client -- the in-Laravel consumer's `RestCatalog`, or any
     * other `IconCatalog` implementation. Mutually exclusive with `catalog`.
     *
     * Unlike `catalog`, nothing is loaded into the store up front: `useRepo` and
     * `useResolvedIcons` call this client directly (via `IconCatalogProvider`),
     * with server-side pagination, debouncing and request cancellation. See
     * `useRestRepoState` for why -- the corpus this client fronts can be
     * hundreds of thousands of icons, and `catalog` mode's "load everything
     * into memory up front" does not scale to that.
     */
    client?: IconCatalog;
    /** Optional app config (accent options, per-page options, user, team). */
    config?: AppConfig | null;
    /**
     * Whether this instance owns the document. **Defaults to false.**
     *
     * When true it sets the theme class and design tokens on `<html>`, plus
     * `lang`/`dir`, `document.title` and the description `<meta>`. Only a standalone
     * app may do that. Embedded in a host page it would hijack the host's theme,
     * text direction, title and SEO metadata — which was the behaviour, unconditionally.
     *
     * Tokens are always applied to the component root regardless, so the app themes
     * correctly either way.
     */
    manageDocument?: boolean;
    /**
     * Whether to mirror filter state into the address bar. **Defaults to false**, for
     * the same reason: a host owns its URL. See `useUrlSync`.
     */
    syncUrl?: boolean;
    /** Namespace for the query params when `syncUrl` is on. */
    urlPrefix?: string;
    /**
     * The store instance backing this mount.
     *
     * Omit it and everything resolves to the module singleton, which is what the
     * standalone app wants. Pass one from `createBrowserStore()` and this instance gets
     * its own filters, selection, favorites, appearance and detail state -- two mounts
     * on a page were previously the same store, so each was overwriting the other.
     */
    store?: BrowserStoreHook;
    /**
     * The language this mount opens in, chosen by the host (an admin page already in
     * Arabic, say). Applied when the mount starts and whenever it changes; the user can
     * still switch afterwards. It is this mount's choice only: it does not write the
     * shared `ichava.locale` key the landing and the other surfaces read. Omit it and the
     * mount follows that shared key, as before.
     */
    locale?: Locale;
}
/**
 * IchavaBrowser — the mountable browser shell, decoupled from any bootstrap.
 * The standalone demo renders this with a static catalog;
 * the in-Laravel consumer (P1) will feed a REST-backed catalog through the same
 * component. Data is loaded into the store on mount; theme tokens are applied to
 * the root so a single accent/radius knob rethemes everything.
 */
export declare function IchavaBrowser({ catalog, client, config, manageDocument, syncUrl, urlPrefix, store, locale }: IchavaBrowserProps): import("react").JSX.Element;
