import { useEffect } from 'react';
import { hydrateLibrary, type BrowserMount, type BrowserPageProps } from '@/core/browserMount';

export type { ServerCollection, ServerHistoryEntry } from '@/core/browserMount';
export type { ServerPagination } from '@/core/InertiaCatalog';

/**
 * Keep a browser mount on the page's props.
 *
 * Every Inertia visit to `Browser/Index` (a page change, a library write's partial reload)
 * hands the page new props. The listing goes into the mount's `InertiaCatalog`, so the
 * browser's next request for that page is answered without another visit, and the library
 * props are written over the store, since the server is the record for those.
 *
 * Filter state is owned by `useFilterSync`, not here: seeding filters from every prop update
 * would clobber in-flight edits.
 */
export function useInertiaCatalog(mount: BrowserMount, props: BrowserPageProps): void {
  const { icons, pagination, appliedFilters, tree, favorites, collections, history } = props;

  useEffect(() => {
    mount.client.update({ icons, pagination, appliedFilters, tree });
  }, [mount, icons, pagination, appliedFilters, tree]);

  useEffect(() => {
    hydrateLibrary(mount.store, { favorites, collections, history });
  }, [mount, favorites, collections, history]);
}
