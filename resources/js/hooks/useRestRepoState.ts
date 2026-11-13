import { useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogMeta, IconCatalog, ListedPage, PackageMeta, VariantMeta } from '@/core/api/ApiClient';
import type { CategoryGroup, ListParams } from '@/modules/catalog';
import type { IconKind, PageResult, Icon } from '@ichava/js-ui-kernel';

/**
 * REST-mode data for `useRepo`. Additive: static mode never touches this file.
 *
 * Two independent load rhythms, because they mean different things:
 *  - `page` refetches on every param change (search/filter/sort/page). Debounced
 *    300ms, matching the search debounce elsewhere in this ecosystem (the brief's
 *    R1-5) -- without it, REST mode would fire one request per keystroke against
 *    a corpus this large.
 *  - `variantCounts` and the pack and variant metadata (`getCatalogMeta`) fetch
 *    ONCE per client.
 *  - `tree` follows the selection when the client can count it that way
 *    (`getTreeFor`: icon-browser's `/icons/tree` takes the grid's filters), on the
 *    same debounce, keyed by the selection without its categories, paging and sort,
 *    so ticking a category or turning a page does not refetch it. A client without
 *    `getTreeFor` keeps the whole-corpus tree, fetched once.
 *
 * Every fetch carries an AbortController, and a stale response arriving after a
 * newer request has started is discarded even if it resolves later -- R1-6 in
 * the brief ("loadIcons has no cancellation or ordering guard... harden it,
 * don't reproduce it"). A race has no stable behaviour to be faithful to.
 */

const SEARCH_DEBOUNCE_MS = 300;

function emptyPage(perPage: number): PageResult<Icon> {
  return { items: [], total: 0, page: 1, perPage, lastPage: 1, rangeStart: 0, rangeEnd: 0 };
}

export interface RestRepoState {
  page: ListedPage;
  /** Icons per kind over the other filters; null until loaded or when the client cannot count. */
  kindCounts: Record<IconKind, number> | null;
  tree: CategoryGroup[];
  variantCounts: Map<string, number>;
  /** The installed packs, with the host's default; empty until loaded or when the client cannot list them. */
  packages: PackageMeta[];
  /** Each pack's variants with their labels and descriptions; empty when the client sends none. */
  variantsByPackage: Readonly<Record<string, VariantMeta[]>>;
  loading: boolean;
  error: unknown;
}

const NO_META: CatalogMeta = { packages: [], variantsByPackage: {} };
const NO_TREE: CategoryGroup[] = [];
const NO_COUNTS = new Map<string, number>();

/** The part of the selection a filter-aware tree is counted over (not categories, paging or sort). */
function treeKey(p: ListParams): string {
  const { categories: _c, subs: _s, page: _p, perPage: _pp, sortBy: _sb, sortDirection: _sd, ...rest } = p;
  return JSON.stringify(rest);
}

/**
 * The packs to open on, once the host's packs are known (Q42). A fresh browser opens on every
 * pack the host has installed: the list the host configured (`config.defaults.packages`, the
 * packs core discovered), less any it does not serve, or, with none configured, every installed
 * pack the catalog or packages API reports. Applies while the selection is still the configured
 * one, or names no pack the host serves. Null to leave the selection alone: a choice the user
 * made, a selection already equal to the opening one, or a host that reports no installed pack.
 */
export function openingPacks(selection: readonly string[], configured: readonly string[], packs: readonly PackageMeta[]): string[] | null {
  const installed = packs.filter((p) => p.installed).map((p) => p.id);
  if (!installed.length) return null;
  const served = new Set(packs.map((p) => p.id));
  const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((id, i) => id === b[i]);
  const untouched = same(selection, configured);
  const meaningless = !selection.some((id) => served.has(id));
  if (!untouched && !meaningless) return null;
  const hosted = configured.filter((id) => served.has(id));
  const next = hosted.length ? hosted : installed;
  return same(selection, next) ? null : next;
}

/**
 * @param client `null` disables this hook entirely (static mode, or no mount
 *   client configured) -- every effect below is a no-op and the returned state
 *   never changes from its empty defaults.
 */
export function useRestRepoState(client: IconCatalog | null, params: ListParams, catQ: string): RestRepoState {
  const [page, setPageState] = useState<ListedPage>(() => emptyPage(params.perPage ?? 60));
  const [kindCounts, setKindCounts] = useState<Record<IconKind, number> | null>(null);
  const [rawTree, setRawTree] = useState<CategoryGroup[]>([]);
  const [variantCounts, setVariantCounts] = useState<Map<string, number>>(new Map());
  const [meta, setMeta] = useState<CatalogMeta>(NO_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // ── listing: debounced, cancelled on supersede ──────────────────────────
  const listController = useRef<AbortController | null>(null);
  const loadedTree = useRef<IconCatalog | null>(null);
  useEffect(() => {
    if (!client) return;

    const timer = setTimeout(() => {
      listController.current?.abort();
      const controller = new AbortController();
      listController.current = controller;
      setLoading(true);
      client
        .listIcons(params, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          // Both shipped catalogs return a `ListedPage`; a host's own may not say why it is empty.
          setPageState(result as ListedPage);
          setError(null);
        })
        .then(() => (client.getKindCounts ? client.getKindCounts(params, controller.signal) : null))
        .then((counts) => {
          if (controller.signal.aborted || counts === undefined) return;
          setKindCounts(counts);
        })
        .catch((e) => {
          if (controller.signal.aborted) return;
          setError(e);
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          setLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      listController.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params is compared by JSON below
  }, [client, JSON.stringify(params)]);

  // ── variant counts + pack and variant metadata: once per client ──────────
  useEffect(() => {
    // Without a client this hook returns its empty defaults (see the return below).
    if (!client) return;
    const controller = new AbortController();
    Promise.all([client.getVariantCounts(params, controller.signal), client.getCatalogMeta ? client.getCatalogMeta(controller.signal) : NO_META])
      .then(([counts, loaded]) => {
        if (controller.signal.aborted) return;
        setVariantCounts(counts);
        setMeta(loaded);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e);
      });
    return () => controller.abort();
    // Deliberately keyed on `client` identity only, not `params` -- see the
    // module comment. A new client (mount re-created, e.g. a config change)
    // does re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  // ── tree: follows the selection when the client can count it so ───────────
  const scoped = !!client?.getTreeFor;
  const scopeKey = scoped ? treeKey(params) : '';
  useEffect(() => {
    if (!client) return;
    const controller = new AbortController();
    const load = () =>
      (client.getTreeFor ? client.getTreeFor(params, controller.signal) : client.getTree(controller.signal))
        .then((tree) => {
          if (controller.signal.aborted) return;
          setRawTree(tree);
        })
        .catch((e) => {
          if (controller.signal.aborted) return;
          setError(e);
        });
    // The first load is immediate; a change of selection waits out the search debounce.
    const debounce = scoped && loadedTree.current === client;
    loadedTree.current = client;
    const timer = debounce ? setTimeout(load, SEARCH_DEBOUNCE_MS) : null;
    if (!debounce) void load();
    return () => {
      if (timer) clearTimeout(timer);
      controller.abort();
    };
    // Keyed on the client and, for a filter-aware client, the selection without its
    // categories, paging and sort (`scopeKey`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, scopeKey]);

  // The sidebar's own search box narrows the ALREADY-FETCHED tree by node name.
  // Pure and synchronous, so it applies to REST-mode's tree exactly the way it
  // applies to static mode's -- see useRepo.ts's own useMemo around the same
  // filter. Without this, `page`/`loading` changing on every keystroke or
  // fetch would re-run the filter and hand every consumer a new tree/cats/sub
  // array identity for no reason.
  const tree = useMemo(() => (client ? filterTreeByQuery(rawTree, catQ) : NO_TREE), [client, rawTree, catQ]);
  const loaded = client ? meta : NO_META;

  return { page, kindCounts, tree, variantCounts: client ? variantCounts : NO_COUNTS, packages: loaded.packages, variantsByPackage: loaded.variantsByPackage, loading, error };
}

function filterTreeByQuery(groups: CategoryGroup[], catQ: string): CategoryGroup[] {
  if (!catQ.trim()) return groups;
  const q = catQ.toLowerCase();
  return groups
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
}
