// The one place this package imports the browser UI from.
//
// The UI is the browser library, whose source lives in this repository since react consolidation
// 3d (2026-11-12): resources/js/index.ts is its public surface, imported from
// ichava/react-icon-browser as a snapshot. It used to be a built library vendored under
// resources/vendor/react-icon-browser. The adapter around it is the rest of this package's own
// code: pages, the props-to-catalog bridge, the Inertia-backed IconCatalog, and the server
// mutations for library state.
//
// The library exports the store's whole shape but not every member's name, so the few names
// the adapter needs are derived here from types it does export. If the library renames one,
// this file is the single place that stops compiling.

import type { BrowserStore, IchavaBrowserProps, IconCatalog } from '@/index';

export * from '@/index';

/** A mount's store: what `browser()...toProps()` creates and `<IchavaBrowser store>` takes. */
export type BrowserStoreHook = NonNullable<IchavaBrowserProps['store']>;

/** The browser's filter state (search, packages, categories, variant, sort, page). */
export type FilterState = BrowserStore['filters'];

/** One library collection, as the store holds it. */
export type Collection = BrowserStore['collections'][number];

/** One history entry, as the store holds it. */
export type HistoryEntry = BrowserStore['history'][number];

/** The package -> category -> subcategory tree the sidebar renders. */
export type CategoryGroup = Awaited<ReturnType<IconCatalog['getTree']>>[number];

/** The installed packs (with the host's default) and each pack's variants: `getCatalogMeta`. */
export type CatalogMeta = Awaited<ReturnType<NonNullable<IconCatalog['getCatalogMeta']>>>;
