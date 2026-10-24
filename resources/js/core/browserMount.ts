import { browser, CONFIG_DEFAULTS, resolveConfig, type BrowserStoreHook, type Collection, type HistoryEntry, type IchavaBrowserProps, type IconId } from '@/lib/browser';
import { InertiaCatalog, type BrowserSnapshot, type VisitFn } from '@/core/InertiaCatalog';
import { appConfig } from '@/core/appConfig';
import { CLIENT_VERBS } from '@/core/libraryDiff';
import { applySeed, type AppliedFilters } from '@/hooks/useFilterSync';
import type { IchavaShared } from '@/types';

/** Server collection rows (`icon_ids` plus resolved icons). */
export interface ServerCollection {
  id: string;
  name: string;
  icon_ids?: number[];
  [key: string]: unknown;
}

/** Server history rows. */
export interface ServerHistoryEntry {
  icon_id: number;
  action: string;
  timestamp?: string;
  [key: string]: unknown;
}

/** The library props a `Browser/Index` visit may carry. */
export interface LibraryPayload {
  favorites?: IconId[] | null;
  collections?: ServerCollection[] | null;
  history?: ServerHistoryEntry[] | null;
}

/** Everything `Browser/Index` receives that the mount reads. */
export type BrowserPageProps = BrowserSnapshot &
  LibraryPayload & {
    appliedFilters?: AppliedFilters | unknown[] | null;
    ichava?: Pick<IchavaShared, 'ui'> | null;
  };

/** One browser mount for one Inertia page: its data client, its store and its props. */
export interface BrowserMount {
  readonly client: InertiaCatalog;
  readonly store: BrowserStoreHook;
  readonly props: IchavaBrowserProps;
}

/** Stores being written from server props, which `useLibrarySync` must not echo back. */
const hydrating = new WeakSet<BrowserStoreHook>();

export function isHydrating(store: BrowserStoreHook): boolean {
  return hydrating.has(store);
}

/**
 * Write server library state over the store. The server is the record: whatever the store
 * holds for favourites, collections or history is replaced by what the props say.
 */
export function hydrateLibrary(store: BrowserStoreHook, payload: LibraryPayload): void {
  const patch: { favorites?: IconId[]; collections?: Collection[]; history?: HistoryEntry[] } = {};

  if (payload.favorites) patch.favorites = payload.favorites.map(Number);

  if (payload.collections) {
    patch.collections = payload.collections.map((c) => ({
      id: String(c.id),
      name: String(c.name ?? ''),
      icons: (c.icon_ids ?? []).map(Number),
    }));
  }

  if (payload.history) {
    patch.history = payload.history.map((h) => {
      const action = String(h.action ?? 'view');
      return {
        id: Number(h.icon_id),
        action: CLIENT_VERBS[action] ?? action,
        ts: h.timestamp ? Date.parse(h.timestamp) || Date.now() : Date.now(),
      };
    });
  }

  if (Object.keys(patch).length === 0) return;
  hydrating.add(store);
  try {
    store.setState(patch);
  } finally {
    hydrating.delete(store);
  }
}

/**
 * Build the browser for `Browser/Index` from its first props.
 *
 * `browser()` is react-icon-browser's builder: the Inertia-backed catalog as its data client,
 * this package's config, and the store persisted under the library's default key (the key the
 * forked UI used, so a user's appearance and filters survive the port). The store is seeded
 * from the server's applied filters and library state **before** the first render, so the
 * browser's first request is the page the props already hold.
 *
 * The document is the page's, as it always was (`manageDocument`); the address bar is
 * Inertia's, so the library's own URL sync stays off.
 */
export function createBrowserMount(page: BrowserPageProps, opts: { url: string; visit?: VisitFn }): BrowserMount {
  const client = new InertiaCatalog(
    {
      icons: page.icons ?? [],
      pagination: page.pagination,
      appliedFilters: page.appliedFilters,
      tree: page.tree,
      packages: page.packages,
      filterOptions: page.filterOptions,
      statistics: page.statistics,
    },
    opts,
  );

  const built = browser()
    .rest(client)
    .config(resolveConfig(appConfig(page.ichava)))
    .persist(CONFIG_DEFAULTS.storageKeys.persist)
    .toProps();

  const store = built.store;
  if (!store) throw new Error('createBrowserMount: browser().persist() returned no store.');

  const applied = Array.isArray(page.appliedFilters) ? null : page.appliedFilters;
  applySeed(store, applied);
  hydrateLibrary(store, page);

  // On a first visit (nothing persisted under the key) the browser applies its config's
  // `defaults` block when the config arrives, which resets the filters to the default
  // package selection and page size. The server's filters are the page the props hold, so
  // they are applied again straight after, inside the same update.
  const unsubscribe = store.subscribe((next, prev) => {
    if (!next.config || prev.config) return;
    unsubscribe();
    applySeed(store, applied);
  });

  return { client, store, props: { ...built, manageDocument: true } };
}
