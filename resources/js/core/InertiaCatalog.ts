import { router } from '@inertiajs/react';
import { toIcon, type Filters, type Icon, type IconCatalog, type IconId, type ListParams, type PageResult } from '@/lib/browser';
import type { CategoryGroup } from '@/lib/browser';
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

/** The props a listing visit reloads. Library props ride along, as they always did. */
export const LISTING_PROPS = ['icons', 'pagination', 'appliedFilters', 'favorites', 'collections', 'history', 'commandHistory'];

const abortError = () => new DOMException('The visit was cancelled.', 'AbortError');

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
      onSuccess: (page) => settle(() => resolve(page.props as unknown as Partial<BrowserSnapshot>)),
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

  async listIcons(params: ListParams, signal?: AbortSignal): Promise<PageResult<Icon>> {
    const query = listParamsToQuery(params);
    if (queryKey(query) !== this.#appliedKey()) {
      this.update(await this.#visit(this.#url, query, signal));
    }
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
