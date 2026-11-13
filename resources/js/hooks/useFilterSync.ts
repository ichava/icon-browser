import { useEffect, useMemo, useRef } from 'react';
import type { BrowserStoreHook, FilterState, ListParams } from '@/lib/browser';

type SortKey = FilterState['sortBy'];
type SortOrder = FilterState['sortOrder'];

/** Validated query echo the server sends back (`appliedFilters` prop). */
export interface AppliedFilters {
  search?: string | null;
  packages?: string[];
  categories?: string[];
  variants?: string[];
  sort_by?: string;
  sort_direction?: string;
  page?: number;
  per_page?: number;
}

/** The query `IconFilterRequest` accepts, as `router.get` sends it. */
export type QueryParams = Record<string, string | number | string[] | undefined>;

const SORT_KEYS: SortKey[] = ['name', 'package', 'category'];

/** `IconFilterRequest`'s `per_page` bounds (`min:10`, `max:120`). */
const PER_PAGE_MIN = 10;
const PER_PAGE_MAX = 120;

/** Server-valid subset of the store filters, mirroring `IconFilterRequest`. */
export function toQueryParams(f: FilterState): QueryParams {
  const search = f.search.trim();
  return {
    search: search.length >= 2 ? search : undefined,
    packages: f.packages.length ? f.packages : undefined,
    categories: f.categories.length ? f.categories : undefined,
    variants: f.variant ? [f.variant] : undefined,
    sort_by: f.sortBy,
    sort_direction: f.sortOrder,
    page: f.page,
    // Server caps per_page below what the client offers; clamp so the echo
    // matches what was sent instead of bouncing a validation error.
    per_page: Math.max(PER_PAGE_MIN, Math.min(f.perPage, PER_PAGE_MAX)),
  };
}

/**
 * The same query from the library's `ListParams`, which is what the browser hands its
 * `IconCatalog`. Subcategories are not sent: `IconFilterRequest` has no `subs` field.
 */
export function listParamsToQuery(p: ListParams): QueryParams {
  const search = (p.search ?? '').trim();
  return {
    search: search.length >= 2 ? search : undefined,
    packages: p.packages?.length ? p.packages : undefined,
    categories: p.categories?.length ? p.categories : undefined,
    variants: p.variants?.length ? p.variants : undefined,
    sort_by: p.sortBy ?? 'name',
    sort_direction: p.sortDirection ?? 'asc',
    page: p.page ?? 1,
    per_page: Math.max(PER_PAGE_MIN, Math.min(p.perPage ?? 60, PER_PAGE_MAX)),
  };
}

/** Normalize a server echo into the same shape `toQueryParams` emits. */
export function echoToQuery(applied: AppliedFilters | null | undefined): QueryParams | null {
  if (!applied || Object.keys(applied).length === 0) return null;
  return {
    search: applied.search || undefined,
    packages: applied.packages?.length ? applied.packages : undefined,
    categories: applied.categories?.length ? applied.categories : undefined,
    variants: applied.variants?.length ? applied.variants : undefined,
    sort_by: applied.sort_by,
    sort_direction: applied.sort_direction,
    page: applied.page,
    per_page: applied.per_page,
  };
}

/** One comparable string per query: the loop guard between the store and the server. */
export function queryKey(query: QueryParams | null): string {
  return query ? JSON.stringify(query) : '';
}

export function seedFilters(applied: AppliedFilters): Partial<FilterState> {
  const sortBy: SortKey = SORT_KEYS.includes(applied.sort_by as SortKey)
    ? (applied.sort_by as SortKey)
    : 'name';
  return {
    search: applied.search ?? '',
    packages: applied.packages ?? [],
    categories: applied.categories ?? [],
    variant: applied.variants?.[0] ?? null,
    sortBy,
    sortOrder: applied.sort_direction === 'desc' ? ('desc' as SortOrder) : ('asc' as SortOrder),
    page: applied.page ?? 1,
    perPage: applied.per_page ?? 60,
  };
}

/** Write the server echo into a store's filters. */
export function applySeed(store: BrowserStoreHook, applied: AppliedFilters | null | undefined): void {
  if (!applied || Object.keys(applied).length === 0) return;
  const seed = seedFilters(applied);
  store.setState((s) => ({ filters: { ...s.filters, ...seed } }));
}

/**
 * Keep the store's filters on what the server says it applied.
 *
 * - Mount: the page seeds the store from the echo before it renders (deep links, the back
 *   button), so this hook only records it.
 * - Echo: when a visit comes back normalized differently than sent, adopt the echo.
 *
 * Navigation is no longer done here. The browser asks its `IconCatalog` for each page, and
 * `InertiaCatalog.listIcons` is the visit (`router.get` with the listing props), so the query
 * string and the store meet in one place. Adopting an echo sets filters the catalog already
 * holds the page for, so it answers without another visit: that is the loop guard.
 */
export function useFilterSync(store: BrowserStoreHook, applied: AppliedFilters | null | undefined) {
  const key = queryKey(echoToQuery(applied));
  const last = useRef(key);
  const seed = useMemo(() => applied, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (key === last.current) return;
    last.current = key;
    // Only a real normalization is adopted. When the server applied exactly what the store
    // asked for, seeding would still overwrite what the query drops (a one-letter search).
    if (key === queryKey(toQueryParams(store.getState().filters))) return;
    applySeed(store, seed);
  }, [key, seed, store]);
}
