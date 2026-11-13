import { router } from '@inertiajs/react';
import { toIcon, type Filters, type Icon, type IconCatalog, type IconId, type ListParams, type PageResult } from '@/lib/browser';
import type { CatalogMeta, CategoryGroup } from '@/lib/browser';
import { normalizeRawIcon, toCategoryGroups, toIconPackage, type ServerIcon, type ServerPackage } from '@/core/propsToCatalog';
import { echoToQuery, listParamsToQuery, queryKey, type AppliedFilters, type QueryParams } from '@/hooks/useFilterSync';

/** Laravel's paginator, as `InertiaBrowserController::index` serializes it. */
export interface ServerPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

/** The listing props of `Browser/Index`: what one visit returns. */
export interface BrowserSnapshot {
  icons: ServerIcon[];
  pagination: ServerPagination;
  appliedFilters?: AppliedFilters | unknown[] | null;
  tree?: unknown;
  packages?: ServerPackage[];
  filterOptions?: unknown;
  statistics?: unknown;
}

/**
 * One server round trip for a new page of icons: the props that came back.
 * The default is an Inertia partial reload (`inertiaVisit`); tests pass their own.
 */
export type VisitFn = (url: string, query: QueryParams, signal?: AbortSignal) => Promise<Partial<BrowserSnapshot>>;

/**
 * The props a listing visit reloads. Library props ride along, as they always did, and so
 * does the tree, which the server counts over the same selection less its categories.
 */
export const LISTING_PROPS = ['icons', 'pagination', 'appliedFilters', 'tree', 'favorites', 'collections', 'history', 'commandHistory'];

const abortError = () => new DOMException('The visit was cancelled.', 'AbortError');

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isIntOrNull = (v: unknown): v is number | null => v === null || isInt(v);

function isServerIcon(v: unknown): v is ServerIcon {
  return isRecord(v) && (typeof v.id === 'number' || typeof v.id === 'string') && typeof v.name === 'string';
}

function isPagination(v: unknown): v is ServerPagination {
  return isRecord(v) && isInt(v.total) && isInt(v.per_page) && isInt(v.current_page) && isInt(v.last_page) && isIntOrNull(v.from) && isIntOrNull(v.to);
}

function isServerPackage(v: unknown): v is ServerPackage {
  return isRecord(v) && typeof v.name === 'string';
}

/**
 * The listing props of one `Browser/Index` visit, checked (re-audit F-15). They come from the
 * server, so each prop the browser reads is checked for the shape it reads before it is used; a
 * partial reload carries only some of them, and a prop that is absent stays absent. Throws on a
 * prop that is present and malformed, which rejects the visit instead of rendering garbage.
 */
export function snapshotFromProps(props: unknown): Partial<BrowserSnapshot> {
  const fail = (what: string): never => {
    throw new Error(`Browser/Index props: ${what}`);
  };
  if (!isRecord(props)) return fail('not an object');
  const out: Partial<BrowserSnapshot> = {};
  if ('icons' in props) {
    if (!Array.isArray(props.icons) || !props.icons.every(isServerIcon)) fail('icons is not a list of icons');
    out.icons = props.icons as ServerIcon[];
  }
  if ('pagination' in props) {
    if (!isPagination(props.pagination)) fail('pagination is not a paginator');
    out.pagination = props.pagination as ServerPagination;
  }
  if ('packages' in props) {
    if (!Array.isArray(props.packages) || !props.packages.every(isServerPackage)) fail('packages is not a list of packages');
    out.packages = props.packages as ServerPackage[];
  }
  if ('appliedFilters' in props) {
    const applied = props.appliedFilters;
    // Laravel serializes an empty associative array as `[]`, so a list is the empty case.
    if (applied !== null && !Array.isArray(applied) && !isRecord(applied)) fail('appliedFilters is not an object');
    out.appliedFilters = applied as AppliedFilters | unknown[] | null;
  }
  // The rest are read by code that checks them itself (toCategoryGroups and the meta readers).
  if ('tree' in props) out.tree = props.tree;
  if ('filterOptions' in props) out.filterOptions = props.filterOptions;
  if ('statistics' in props) out.statistics = props.statistics;
  return out;
}

/**
 * `router.get` as a promise: resolves with the new page props, rejects when the visit fails or
 * is cancelled. The browser cancels a listing request whenever a newer one supersedes it, and
 * that abort cancels the visit; Inertia also cancels a visit itself when another starts.
 */
export const inertiaVisit: VisitFn = (url, query, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    let settled = false;
    let cancel: (() => void) | null = null;
    const onAbort = () => cancel?.();
    signal?.addEventListener('abort', onAbort, { once: true });
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      fn();
    };

    router.get(url, query, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      only: LISTING_PROPS,
      onCancelToken: (token) => {
        cancel = () => token.cancel();
      },
      onSuccess: (page) =>
        settle(() => {
          try {
            resolve(snapshotFromProps(page.props));
          } catch (error) {
            reject(error);
          }
        }),
      onError: (errors) => settle(() => reject(new Error(Object.values(errors).join(' ') || 'The server rejected the filters.'))),
      onCancel: () => settle(() => reject(abortError())),
      onFinish: () => settle(() => reject(abortError())),
    });
  });

function toPage(s: BrowserSnapshot): PageResult<Icon> {
  const p = s.pagination;
  return {
    items: s.icons.map((raw) => toIcon(normalizeRawIcon(raw))),
    total: p.total,
    page: p.current_page,
    perPage: p.per_page,
    lastPage: p.last_page,
    rangeStart: p.from ?? 0,
    rangeEnd: p.to ?? 0,
  };
}

type Term = Filters['categories'][number];
type PackageMeta = CatalogMeta['packages'][number];
type VariantMeta = CatalogMeta['variantsByPackage'][string][number];

/**
 * A query as the tree is counted over it: everything but the category selection, paging
 * and sort, the same scope as react-icon-browser's `RestCatalog.getTreeFor`.
 */
function treeKey(query: QueryParams | null): string {
  if (!query) return '';
  const { categories: _c, subs: _s, page: _p, per_page: _pp, sort_by: _sb, sort_direction: _sd, ...rest } = query;
  return queryKey(rest);
}

/** A `Browser/Index` pack row (`IconBrowserService::getFilters()`), with the host's default. */
function toPackageMeta(pkg: ServerPackage): PackageMeta {
  return {
    ...toIconPackage(pkg),
    ...(pkg.kind === 'icon' || pkg.kind === 'illustration' ? { kind: pkg.kind } : {}),
    ...(pkg.default === true ? { default: true } : {}),
  };
}

/** `variants_by_package`: each pack's variants (core's `VariantData`). PHP sends an empty map as []. */
function toVariantMap(raw: unknown): Record<string, VariantMeta[]> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, VariantMeta[]> = {};
  for (const [pack, list] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(list)) continue;
    out[pack] = list.flatMap((v): VariantMeta[] => {
      if (!v || typeof v !== 'object') return [];
      const row = v as Record<string, unknown>;
      if (typeof row.slug !== 'string') return [];
      return [
        {
          slug: row.slug,
          label: typeof row.label === 'string' && row.label ? row.label : row.slug,
          description: typeof row.description === 'string' ? row.description : '',
          default: row.default === true,
        },
      ];
    });
  }
  return out;
}

/** `IconBrowserService::getFilters()` term rows, whatever spelling they arrive in. */
function toTerms(input: unknown): Term[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap((raw): Term[] => {
    if (!raw || typeof raw !== 'object') return [];
    const t = raw as Record<string, unknown>;
    const name = typeof t.name === 'string' ? t.name : typeof t.slug === 'string' ? t.slug : null;
    if (!name) return [];
    return [
      {
        id: typeof t.id === 'number' || typeof t.id === 'string' ? t.id : name,
        name,
        label: typeof t.label === 'string' ? t.label : name,
        count: typeof t.count === 'number' ? t.count : typeof t.icon_count === 'number' ? t.icon_count : 0,
        ...(typeof t.package === 'string' ? { package: t.package } : {}),
      },
    ];
  });
}

/**
 * The browser's `IconCatalog`, backed by Inertia instead of the JSON API.
 *
 * `Browser/Index` already arrives with one page of icons, the tree, the packages and the filter
 * options, so the first request is answered from those props with no network at all. Any other
 * page is a partial reload of the same Inertia route (`inertiaVisit`), which also keeps the
 * query string on the filters, as `useFilterSync` used to do by itself. That keeps the browser
 * working with `ichava.icon-browser.api.enabled` off, which is the default.
 *
 * What the props cannot answer is answered from what has been loaded: `getIcon` and
 * `getRelated` look through every icon seen so far, and the variant counts are the server's
 * corpus-wide counts, the same scope `RestCatalog` reports.
 */
export class InertiaCatalog implements IconCatalog {
  readonly #url: string;
  readonly #visit: VisitFn;
  #snapshot: BrowserSnapshot;
  readonly #seen = new Map<IconId, Icon>();
  /** The visit in flight, so the grid and the tree asking for one selection share it. */
  #pending: { key: string; promise: Promise<void> } | null = null;

  constructor(snapshot: BrowserSnapshot, opts: { url: string; visit?: VisitFn }) {
    this.#url = opts.url;
    this.#visit = opts.visit ?? inertiaVisit;
    this.#snapshot = snapshot;
    this.#remember(snapshot);
  }

  /** Fold a newer visit's props in: the page component calls this on every props change. */
  update(props: Partial<BrowserSnapshot>): void {
    const next = { ...this.#snapshot, ...props } as BrowserSnapshot;
    if (!Array.isArray(next.icons) || !next.pagination) return;
    this.#snapshot = next;
    this.#remember(next);
  }

  #remember(s: BrowserSnapshot): void {
    for (const raw of s.icons ?? []) {
      const icon = toIcon(normalizeRawIcon(raw));
      this.#seen.set(icon.id, icon);
    }
  }

  #appliedKey(): string {
    const applied = this.#snapshot.appliedFilters;
    return queryKey(Array.isArray(applied) ? null : echoToQuery(applied));
  }

  /** Bring the snapshot to `query`: nothing when it is already there, else one visit. */
  async #load(query: QueryParams, signal?: AbortSignal): Promise<void> {
    const key = queryKey(query);
    if (key === this.#appliedKey()) return;
    const pending = this.#pending;
    if (pending?.key === key) {
      try {
        await pending.promise;
      } catch (e) {
        if (signal?.aborted) throw e;
      }
      if (key === this.#appliedKey()) return;
    }
    const promise = this.#visit(this.#url, query, signal).then((props) => this.update(props));
    this.#pending = { key, promise };
    try {
      await promise;
    } finally {
      if (this.#pending?.promise === promise) this.#pending = null;
    }
  }

  async listIcons(params: ListParams, signal?: AbortSignal): Promise<PageResult<Icon>> {
    await this.#load(listParamsToQuery(params), signal);
    if (signal?.aborted) throw abortError();
    return toPage(this.#snapshot);
  }

  async getIcon(id: IconId): Promise<Icon | null> {
    return this.#seen.get(id) ?? null;
  }

  async getSvg(icon: Icon, signal?: AbortSignal): Promise<string> {
    if (icon.svgContent) return icon.svgContent;
    if (!icon.svgUrl) return '';
    const res = await fetch(icon.svgUrl, { credentials: 'same-origin', signal });
    return res.ok ? res.text() : '';
  }

  async getFilters(): Promise<Filters> {
    const opts = (this.#snapshot.filterOptions ?? {}) as Record<string, unknown>;
    const packages = Array.isArray(opts.packages) ? (opts.packages as ServerPackage[]) : (this.#snapshot.packages ?? []);
    return {
      packages: packages.filter((p) => p && typeof p.name === 'string').map(toIconPackage),
      categories: toTerms(opts.categories),
      variants: toTerms(opts.variants),
    };
  }

  async getStatistics(): Promise<Record<string, unknown>> {
    const stats = this.#snapshot.statistics;
    return stats && typeof stats === 'object' ? (stats as Record<string, unknown>) : {};
  }

  async getTree(): Promise<CategoryGroup[]> {
    return toCategoryGroups(this.#snapshot.tree);
  }

  /**
   * The tree counted over `params` less its categories, paging and sort, so it agrees with
   * the grid. The `tree` prop is that already when the selection matches what was applied;
   * otherwise it comes with the listing visit for `params`, the one the grid makes too.
   */
  async getTreeFor(params: ListParams, signal?: AbortSignal): Promise<CategoryGroup[]> {
    const query = listParamsToQuery(params);
    const applied = this.#snapshot.appliedFilters;
    if (treeKey(query) !== treeKey(Array.isArray(applied) ? null : echoToQuery(applied))) {
      await this.#load(query, signal);
    }
    if (signal?.aborted) throw abortError();
    return toCategoryGroups(this.#snapshot.tree);
  }

  /**
   * The installed packs, with the one the host opens on (`default`), and each pack's
   * variants with their labels and descriptions, from the page's `packages` and
   * `filterOptions.variants_by_package` props: what `RestCatalog` reads from `/icons/filters`.
   */
  async getCatalogMeta(): Promise<CatalogMeta> {
    const opts = (this.#snapshot.filterOptions ?? {}) as Record<string, unknown>;
    const packages = this.#snapshot.packages ?? (Array.isArray(opts.packages) ? (opts.packages as ServerPackage[]) : []);
    return {
      packages: packages.filter((p) => p && typeof p.name === 'string').map(toPackageMeta),
      variantsByPackage: toVariantMap(opts.variants_by_package),
    };
  }

  async getRelated(icon: Icon, limit = 6): Promise<Icon[]> {
    const out: Icon[] = [];
    for (const other of this.#seen.values()) {
      if (other.id !== icon.id && other.category === icon.category) out.push(other);
      if (out.length >= limit) break;
    }
    return out;
  }

  async getVariantCounts(): Promise<Map<string, number>> {
    const filters = await this.getFilters();
    return new Map(filters.variants.map((v) => [v.name, v.count]));
  }
}
