import { useEffect, useMemo } from 'react';
import { CatalogIndex as IconRepository } from '@/modules/catalog';
import type { CategoryGroup } from '@/modules/catalog';
import type { IconKind } from '@ichava/js-ui-kernel';
import { emptyReasonFor, type ListedPage } from '@/core/api/ApiClient';
import { searchLanguageFor } from '@/modules/host';
import { toListParams } from '@/store';
import { useAppStore } from '@/hooks/useStoreApi';
import { useIconCatalogClient } from '@/hooks/useIconCatalogClient';
import { openingPacks, useRestRepoState } from '@/hooks/useRestRepoState';
import { useStoreApi } from '@/hooks/useStoreApi';
import { DEFAULT_FILTERS } from '@/core/defaults';
import type { PackageMeta, VariantMeta } from '@/core/api/ApiClient';

/** Stores that have already opened on the host's default pack: once per mount, not per caller. */
const openedOnDefault = new WeakSet<object>();
const NO_VARIANTS: Readonly<Record<string, VariantMeta[]>> = {};

/**
 * The single derived-data boundary, for BOTH modes.
 *
 * Static mode (a `catalog` in the store): every count -- results, chips,
 * pagination, tree -- comes from one memoized `IconRepository`, synchronously,
 * exactly as before this hook learned about REST mode. This branch is
 * unchanged in behaviour and timing; it is what every existing test and the
 * whole e2e suite exercises, and it stays that way on purpose.
 *
 * REST mode (an explicit `client` from `useIconCatalogClient`, no `catalog`):
 * the same four values come from `useRestRepoState`, which calls the live API
 * with debouncing and request cancellation. See that file for why the listing
 * and the tree/counts load on different rhythms.
 *
 * `repo` and `catalog` are `null` in REST mode -- there is no in-memory
 * `IconRepository` or full catalog to hand back. A caller that destructures
 * `repo`/`catalog` and calls a method on it without a null-check will crash in
 * REST mode; `LibraryDialog`, `AppToolbar`, `IconDetailDialog` and
 * `SharedCollectionsModal` were audited for exactly this and updated to resolve
 * icons through `useResolvedIcons` instead, which works in both modes.
 */
export function useRepo() {
  const catalog = useAppStore((s) => s.catalog);
  const filters = useAppStore((s) => s.filters);
  const catQ = useAppStore((s) => s.catQ);
  const setPage = useAppStore((s) => s.setPage);
  // On PostgreSQL the host can stem the search in the reader's language; elsewhere the
  // server ignores it, and the manifest says the feature is off.
  const language = useAppStore((s) => (s.config?.features.searchLanguage ? searchLanguageFor(s.locale) : undefined));

  const params = useMemo(() => ({ ...toListParams(filters), ...(language ? { language } : {}) }), [filters, language]);

  // ── static mode: unchanged ───────────────────────────────────────────────
  const repo = useMemo(() => (catalog ? new IconRepository(catalog) : null), [catalog]);

  const staticPage: ListedPage = useMemo(() => {
    if (!repo || !catalog) return { items: [], total: 0, page: 1, perPage: filters.perPage, lastPage: 1, rangeStart: 0, rangeEnd: 0, emptyReason: null };
    const p = repo.page(params);
    return { ...p, emptyReason: emptyReasonFor(p, params, catalog.icons.length) };
  }, [repo, catalog, params, filters.perPage]);

  const staticKindCounts: Record<IconKind, number> | null = useMemo(() => (repo ? repo.kindCounts(params) : null), [repo, params]);

  const staticTree: CategoryGroup[] = useMemo(() => {
    if (!repo) return [];
    const all = repo.categoryTree(params);
    if (!catQ.trim()) return all;
    const q = catQ.toLowerCase();
    return all
      .map((g) => ({
        ...g,
        cats: g.cats
          .map((c) => {
            const catHit = c.name.toLowerCase().includes(q);
            const subHit = c.sub?.filter((sc) => sc.name.toLowerCase().includes(q));
            if (catHit) return c;
            if (subHit && subHit.length) return { ...c, sub: subHit };
            return null;
          })
          .filter((c): c is NonNullable<typeof c> => c !== null),
      }))
      .filter((g) => g.cats.length > 0);
  }, [repo, params, catQ]);

  const staticVariantCounts = useMemo(() => (repo ? repo.variantCounts(params) : new Map<string, number>()), [repo, params]);

  // ── REST mode: additive ──────────────────────────────────────────────────
  // Only active when this mount has an explicit client AND no static catalog
  // was also supplied. A mount is one or the other, never both.
  const explicitClient = useIconCatalogClient();
  const restClient = catalog ? null : explicitClient;
  const rest = useRestRepoState(restClient, params, catQ);

  const page = catalog ? staticPage : rest.page;
  const tree = catalog ? staticTree : rest.tree;
  const variantCounts = catalog ? staticVariantCounts : rest.variantCounts;
  const kindCounts = catalog ? staticKindCounts : rest.kindCounts;
  // The packs: the static catalog's, or the ones a REST host lists (with its default).
  const packages: PackageMeta[] = useMemo(() => (catalog ? catalog.packages : rest.packages), [catalog, rest.packages]);
  const variantsByPackage = catalog ? NO_VARIANTS : rest.variantsByPackage;

  // Every mode opens on every pack the host has installed (Q42), once per mount, while the
  // selection is still the one a fresh browser starts with (or names no pack this host serves).
  const storeApi = useStoreApi();
  const configured = useAppStore((s) => s.config?.defaults.packages);
  useEffect(() => {
    if (!packages.length || openedOnDefault.has(storeApi)) return;
    openedOnDefault.add(storeApi);
    const next = openingPacks(storeApi.getState().filters.packages, configured ?? DEFAULT_FILTERS.packages, packages);
    if (next) storeApi.getState().selectAllPacks(next);
  }, [packages, storeApi, configured]);

  // Keep the stored page in range: a deep-linked `?page=99` or a shrunk result
  // set would otherwise strand the page above lastPage (Prev appears frozen).
  useEffect(() => {
    if (page.total > 0 && filters.page !== page.page) setPage(page.page);
  }, [filters.page, page.page, page.total, setPage]);

  return {
    repo,
    page,
    tree,
    variantCounts,
    /** Icons per kind over the other filters, for the Icons | Illustrations switch. */
    kindCounts,
    /** The packs to list: the static catalog's, or a REST host's (empty until loaded). */
    packages,
    /** Each pack's variants with labels and descriptions; a REST host's, empty in static mode. */
    variantsByPackage,
    catalog,
    /** `null` in static mode. Pass to `useResolvedIcons` / call directly for REST-only needs. */
    client: catalog ? null : explicitClient,
    loading: catalog ? false : rest.loading,
    error: catalog ? null : rest.error,
  };
}
