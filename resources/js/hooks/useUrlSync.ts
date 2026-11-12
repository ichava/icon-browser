import { createContext, useContext, useEffect, useRef } from 'react';

import type { SortKey, SortOrder } from '@/core/types';
import { useAppStore, useStoreApi } from '@/hooks/useStoreApi';

export interface UrlSyncOptions {
  /**
   * Off by default. The browser must not own the URL when embedded in a host page.
   *
   * Only the standalone app enables this. Previously it was unconditional, which
   * made the in-Laravel kill switch defeat itself: mounting at
   * `/ichava/icons?ui=react` rewrote the query on first render and erased the very
   * flag that selected React.
   */
  enabled?: boolean;
  /**
   * Prefix for the params this hook owns, so they cannot collide with a host's.
   * Empty keeps the short unprefixed names the standalone app has always used and
   * whose links are already shared.
   */
  prefix?: string;
}

/**
 * A permalink to `iconId`: the current URL with only this mount's icon param set.
 *
 * The detail dialog used to build `origin + pathname + ?icon=<id>`, which dropped the
 * host's own query and hash (including the `ui=react` flag that selects this frontend
 * inside Laravel) and ignored the mount's prefix (A6-gaps G7).
 */
export function permalinkFor(href: string, iconId: number, prefix = ''): string {
  const url = new URL(href);
  url.searchParams.set(`${prefix}icon`, String(iconId));
  return url.toString();
}

/** Whether this mount reads the URL, and under which prefix. Provided by `IchavaBrowser`. */
export const UrlSyncContext = createContext<{ enabled: boolean; prefix: string }>({ enabled: false, prefix: '' });

/** A permalink builder for the current mount, or null when it does not read the URL. */
export function usePermalink(): ((iconId: number) => string) | null {
  const { enabled, prefix } = useContext(UrlSyncContext);
  if (!enabled) return null;
  return (iconId) => permalinkFor(window.location.href, iconId, prefix);
}

/** The params this hook owns. Anything else in the query string belongs to the host. */
const OWNED = ['q', 'packages', 'cats', 'variant', 'sort', 'order', 'page', 'per', 'icon'] as const;

/**
 * Permalinks and shareable state. On mount, hydrate filters plus an open icon from
 * the URL (`?icon=<id>` deep-links a detail view); thereafter mirror filter and
 * detail state back into the query string.
 *
 * Two invariants, both of which were violated:
 *
 * 1. It must be opt-in. See `enabled`.
 * 2. It must preserve what it does not own. The previous implementation built a
 *    fresh URLSearchParams and replaced the whole query, discarding every param the
 *    host had set and dropping the hash. It now edits only its own keys in place.
 */
export function useUrlSync({ enabled = false, prefix = '' }: UrlSyncOptions = {}) {
  const storeApi = useStoreApi();
  const hydrated = useRef(false);

  // Hydrate once from the URL (overrides persisted state, for shareability).
  useEffect(() => {
    if (!enabled || hydrated.current) return;
    hydrated.current = true;
    const key = (k: string) => `${prefix}${k}`;
    const p = new URLSearchParams(window.location.search);
    const s = storeApi.getState();
    const num = (v: string | null, d: number) => (v && Number.isFinite(+v) ? +v : d);

    const next = { ...s.filters };
    if (p.has(key('q'))) next.search = p.get(key('q')) ?? '';
    if (p.has(key('packages'))) next.packages = split(p.get(key('packages')));
    if (p.has(key('cats'))) next.categories = split(p.get(key('cats')));
    if (p.has(key('variant'))) next.variant = p.get(key('variant')) || null;
    if (p.has(key('sort'))) next.sortBy = (p.get(key('sort')) as SortKey) || 'name';
    if (p.has(key('order'))) next.sortOrder = (p.get(key('order')) as SortOrder) || 'asc';
    if (p.has(key('page'))) next.page = num(p.get(key('page')), 1);
    if (p.has(key('per'))) next.perPage = num(p.get(key('per')), 60);
    storeApi.setState({ filters: next });

    const icon = p.get(key('icon'));
    if (icon && Number.isFinite(+icon)) s.openDetail(+icon);
    // `enabled` and `prefix` are wiring, fixed for the life of a mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirror state → URL, touching only our own keys.
  const filters = useAppStore((s) => s.filters);
  const detailId = useAppStore((s) => s.detailId);
  useEffect(() => {
    if (!enabled || !hydrated.current) return;
    const key = (k: string) => `${prefix}${k}`;

    // Start from what is already there so host params survive, then clear only ours.
    const p = new URLSearchParams(window.location.search);
    for (const k of OWNED) p.delete(key(k));

    if (filters.search) p.set(key('q'), filters.search);
    if (filters.packages.length) p.set(key('packages'), filters.packages.join(','));
    if (filters.categories.length) p.set(key('cats'), filters.categories.join(','));
    if (filters.variant) p.set(key('variant'), filters.variant);
    if (filters.sortBy !== 'name') p.set(key('sort'), filters.sortBy);
    if (filters.sortOrder !== 'asc') p.set(key('order'), filters.sortOrder);
    if (filters.page > 1) p.set(key('page'), String(filters.page));
    if (filters.perPage !== 60) p.set(key('per'), String(filters.perPage));
    if (detailId != null) p.set(key('icon'), String(detailId));

    const qs = p.toString();
    // The hash is the host's too — a deep link into its own page must survive.
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', url);
  }, [filters, detailId, enabled, prefix]);
}

function split(v: string | null): string[] {
  return v ? v.split(',').filter(Boolean) : [];
}
