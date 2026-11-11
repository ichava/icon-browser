import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { IchavaBrowser, type IconId } from '@/lib/browser';
import { FlashToasts } from '@/components/FlashToasts';
import { createBrowserMount, type ServerCollection, type ServerHistoryEntry } from '@/core/browserMount';
import { useInertiaCatalog } from '@/hooks/useInertiaCatalog';
import { useInertiaMutations } from '@/hooks/useInertiaMutations';
import { useLibrarySync } from '@/hooks/useLibrarySync';
import { useFilterSync, type AppliedFilters } from '@/hooks/useFilterSync';
import type { ServerPagination } from '@/core/InertiaCatalog';
import type { ServerIcon, ServerPackage } from '@/core/propsToCatalog';
import type { SharedProps } from '@/types';

interface BrowserIndexProps extends SharedProps {
  icons: ServerIcon[];
  pagination: ServerPagination;
  appliedFilters: AppliedFilters | unknown[];
  filterOptions?: unknown;
  statistics?: unknown;
  tree: unknown;
  packages: ServerPackage[];
  favorites: IconId[];
  collections: ServerCollection[];
  history: ServerHistoryEntry[];
}

/**
 * The browser page: react-icon-browser's `IchavaBrowser`, fed by this package's Inertia props.
 *
 * The mount (catalog, store, props) is built once from the first visit; later visits update it
 * in place (`useInertiaCatalog`), the store's filters follow the server's echo
 * (`useFilterSync`), and library changes go back to the server (`useLibrarySync`).
 */
export default function BrowserIndex() {
  const { props } = usePage<BrowserIndexProps>();
  const [mount] = useState(() => createBrowserMount(props, { url: window.location.pathname }));

  useInertiaCatalog(mount, props);
  useFilterSync(mount.store, Array.isArray(props.appliedFilters) ? null : props.appliedFilters);
  useLibrarySync(mount.store, useInertiaMutations());

  // The browser fills its container (`height: 100%`) and scrolls its own regions, so this page
  // gives it the viewport, as react-icon-browser's standalone app does. The forked UI grew
  // with its content instead (`min-h-dvh`).
  return (
    <div data-ichava-page="browser" style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <FlashToasts store={mount.store} />
      <IchavaBrowser {...mount.props} />
    </div>
  );
}
