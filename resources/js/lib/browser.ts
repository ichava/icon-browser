// The one place this package imports the browser UI from.
//
// The UI is @ichava/react-icon-browser, vendored as a built library under
// resources/vendor/react-icon-browser (see .dev/tools/sync-react-icon-browser.mjs). Everything
// in resources/js is the Inertia adapter around it: pages, the props-to-catalog bridge, the
// Inertia-backed IconCatalog, and the server mutations for library state.
//
// The library exports the store's whole shape but not every member's name, so the few names
// the adapter needs are derived here from types it does export. If the library renames one,
// this file is the single place that stops compiling.

import type { BrowserStore, IchavaBrowserProps, IconCatalog } from '@ichava/react-icon-browser';

export * from '@ichava/react-icon-browser';

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
