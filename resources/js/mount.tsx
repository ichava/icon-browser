import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IchavaBrowser } from './IchavaBrowser';
import { createBrowserStore, type AppConfig, type BrowserStoreHook } from './store';
import type { Catalog } from '@/modules/catalog';
import type { IconCatalog } from './core/api/ApiClient';
import type { Locale } from './core/i18n';
import { BrowserBuilder } from './app/BrowserBuilder';

export interface MountOptions {
  /** A pre-loaded static catalog. Mutually exclusive with `client`. */
  catalog?: Catalog;
  /**
   * An explicit data client -- `createCatalog('rest', { base })` for the real,
   * paginated corpus, or any other `IconCatalog` implementation. Mutually
   * exclusive with `catalog`; exactly one is required. See `IchavaBrowserProps`
   * for why `catalog` mode does not scale to the full corpus.
   */
  client?: IconCatalog;
  config?: AppConfig | null;
  /**
   * Let the browser own the host document: theme class and tokens on `<html>`,
   * `lang`/`dir`, `document.title`, the description `<meta>`. **Default false.**
   * Only set this if the mount really is the whole page.
   */
  manageDocument?: boolean;
  /** Let the browser write filter state into the address bar. **Default false.** */
  syncUrl?: boolean;
  /** Namespace for those query params when `syncUrl` is on, e.g. `ichava_`. */
  urlPrefix?: string;
  /**
   * The store for this mount. Omit it and a fresh one is created, which is what makes
   * two mounts on one page independent.
   *
   * Pass the exported `useStore` singleton to deliberately share state with the
   * standalone app -- and note that two mounts sharing one persist key is not
   * independence, since they would sync through storage.
   */
  store?: BrowserStoreHook;
  /**
   * Persist key for the auto-created store. `null` means this mount keeps its
   * preferences in memory only, which is usually right for a secondary mount.
   */
  persistKey?: string | null;
  /** The language this mount opens in; see `IchavaBrowserProps.locale`. Omit it to follow the shared `ichava.locale` key. */
  locale?: Locale;
}

/**
 * Imperative mount for Blade/host embedding: `mountIchavaBrowser(el, { catalog })`.
 * Returns the React root so the host can unmount.
 *
 * The defaults are the embedding contract: mounting touches no document-level state
 * and never writes to history. A host that mounts this into a page keeps its own
 * theme, text direction, title, SEO metadata, query string and hash.
 */
export function mountIchavaBrowser(el: HTMLElement, opts: MountOptions): Root {
  // A FRESH store per mount unless the caller supplies one. The module singleton used
  // to back every mount, so two instances on a page shared filters, selection,
  // favorites and theme -- each silently overwriting the other.
  const store = opts.store ?? createBrowserStore(opts.persistKey === undefined ? {} : { persistKey: opts.persistKey });
  const root = createRoot(el);
  root.render(
    <StrictMode>
      {/*
        Forwarded WITHOUT restating the defaults. Writing `opts.manageDocument ?? false`
        here would put the safe default in two places, and the outer one shields the
        inner from any test -- flipping IchavaBrowser's default back to true left the
        embedding spec green. One default, one place.
      */}
      <IchavaBrowser
        catalog={opts.catalog}
        client={opts.client}
        config={opts.config ?? null}
        manageDocument={opts.manageDocument}
        syncUrl={opts.syncUrl}
        urlPrefix={opts.urlPrefix}
        store={store}
        locale={opts.locale}
      />
    </StrictMode>,
  );
  return root;
}

/**
 * The fluent way to mount: `browser().rest(RestCatalog.at('/admin/ichava/api/v1')).persist('ichava.admin').mount(el)`.
 * `.mount(el)` is `mountIchavaBrowser(el, builder.toOptions())` and returns a
 * `BrowserHandle` (`store`, `unmount()`, `Symbol.dispose`). `.toProps()` feeds
 * `<IchavaBrowser>`. Both existing paths are unchanged.
 */
export function browser(): BrowserBuilder {
  return new BrowserBuilder({ mount: mountIchavaBrowser, createStore: createBrowserStore });
}
