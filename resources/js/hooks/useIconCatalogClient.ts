import { createContext, useContext } from 'react';
import type { IconCatalog } from '@/core/api/ApiClient';

/**
 * Per-mount data client, mirroring the `StoreProvider` pattern in `useStoreApi.ts`
 * exactly -- same reason. `mountIchavaBrowser` constructs one `IconCatalog` per
 * mount (static or REST), and every consumer below it needs to reach it without
 * threading it through nine components' prop lists.
 *
 * With no provider, `useRepo` falls back to constructing a `StaticCatalog` from
 * the store's `catalog`, which is the existing, unchanged, fully-tested path.
 * A provider is only present when `mount.tsx` was given an explicit `client`.
 */
const IconCatalogContext = createContext<IconCatalog | null>(null);

export const IconCatalogProvider = IconCatalogContext.Provider;

/** The explicit client for this part of the tree, or `null` in static mode. */
export function useIconCatalogClient(): IconCatalog | null {
  return useContext(IconCatalogContext);
}
