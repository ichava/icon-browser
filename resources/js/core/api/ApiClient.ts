// The typed data boundary (plan C2/C9). Two adapters implement one `IconCatalog`
// port: `StaticCatalog` (bundled JSON — standalone/demo) and `RestCatalog`
// (the live `/ichava/api/v1`). Components never see this; the app wires it via hooks.
// The REST adapter is the ONLY place Laravel envelope quirks live (plan C9).

import { CatalogIndex as IconRepository } from '@/modules/catalog';
import type { Catalog, CategoryGroup, ListParams } from '@/modules/catalog';
import { toIcon, type Envelope, type Filters, type Icon, type IconId, type IconKind, type IconPackage, type PageResult, type RawIcon } from '@ichava/js-ui-kernel';
import { withThemeVariants } from '../themeVariants';
import type { ApiManifest, EmptyReason } from './schema.gen';
import { fillTemplate } from './endpointTemplate';

// Re-exported so existing consumers keep importing it from here; it is declared with the
// catalog module, as the kernel's parameters plus icon-browser's newer filters.
export type { ListParams };

/**
 * A page, plus why it is empty when it is: `no_match` (the filters exclude everything)
 * or `no_icons` (nothing is installed or seeded). Static mode works it out itself; REST
 * mode reads icon-browser's `meta.empty_reason`.
 */
export type ListedPage = PageResult<Icon> & { emptyReason?: EmptyReason };

/** Why a page came back empty, worked out the way icon-browser does. */
export function emptyReasonFor(page: PageResult<Icon>, params: ListParams, catalogSize: number): EmptyReason {
  if (page.total > 0) return null;
  if (catalogSize === 0) return 'no_icons';
  const narrowed =
    !!params.search?.trim() ||
    !!params.categories?.length ||
    !!params.subs?.length ||
    !!params.variants?.length ||
    !!params.tags?.length ||
    !!params.keywords?.length ||
    !!params.kind;
  return narrowed || !!params.packages?.length ? 'no_match' : 'no_icons';
}
import { getDefaultTransport, type CsrfStrategy, type HttpTransport, type RequestOpts } from './httpClient';


/** The port every consumer talks to, regardless of data source. */
export interface IconCatalog {
  listIcons(params: ListParams, signal?: AbortSignal): Promise<PageResult<Icon>>;
  getIcon(id: IconId, signal?: AbortSignal): Promise<Icon | null>;
  getSvg(icon: Icon, signal?: AbortSignal): Promise<string>;
  getFilters(signal?: AbortSignal): Promise<Filters>;
  getStatistics(signal?: AbortSignal): Promise<Record<string, unknown>>;
  /**
   * Package -> category -> subcategory tree, over the WHOLE corpus -- neither
   * adapter narrows this by the active filters. `StaticCatalog.getTree()` calls
   * `IconRepository.categoryTree()` with empty params, same as `RestCatalog`'s
   * unfiltered `/icons/tree` call; a live-filtered tree in static mode comes
   * from calling `IconRepository.categoryTree(params)` directly, which is what
   * `useRepo.ts` does instead of going through this port. REST mode has no
   * such bypass, so its callers are stuck with the unfiltered tree this method
   * returns. Making the REST endpoint filter-aware is real backend work
   * (closer to R-P13's "search mirrored server-side" than to Laravel wiring)
   * and is deliberately out of scope here.
   */
  getTree(signal?: AbortSignal): Promise<CategoryGroup[]>;
  /** Up to `limit` other icons sharing this icon's category, excluding itself. */
  getRelated(icon: Icon, limit?: number, signal?: AbortSignal): Promise<Icon[]>;
  /**
   * Variant term counts.
   *
   * The static adapter mirrors `IconRepository.variantCounts`, scoped to the
   * current package/search selection (ignoring category/variant, same as the
   * tree). The REST adapter has no scoped equivalent to call -- `getFilters()`
   * is the only counted-variants endpoint, and its counts are corpus-wide, not
   * scoped to the active filters. Returned anyway, labelled by its real scope
   * rather than silently pretending to match static mode.
   */
  getVariantCounts(params: ListParams, signal?: AbortSignal): Promise<Map<string, number>>;
  /**
   * Icons per kind over the other filters, for the Icons | Illustrations switch.
   * Optional so a host's own catalog still satisfies the port; without it the switch
   * stays hidden.
   */
  getKindCounts?(params: ListParams, signal?: AbortSignal): Promise<Record<IconKind, number>>;
  /**
   * The category tree counted over `params` (all but the category selection), so it
   * agrees with the grid. Optional: a catalog without it keeps the whole-corpus `getTree`.
   */
  getTreeFor?(params: ListParams, signal?: AbortSignal): Promise<CategoryGroup[]>;
  /**
   * The installed packs (with the host's default) and each pack's variant labels and
   * descriptions. Optional: without it, REST mode lists no packs and shows no variant
   * descriptions.
   */
  getCatalogMeta?(signal?: AbortSignal): Promise<CatalogMeta>;
}

// ── Static adapter: a bundled catalog, filtered/sorted/paginated client-side ──
export class StaticCatalog implements IconCatalog {
  private readonly repo: IconRepository;
  readonly #catalog: Catalog;
  constructor(catalog: Catalog) {
    this.#catalog = catalog;
    this.repo = new IconRepository(catalog);
  }
  // Typed as the port's `PageResult` (the public signature); the page also carries
  // `emptyReason`, which `ListedPage` names for callers that want it.
  async listIcons(params: ListParams): Promise<PageResult<Icon>> {
    const page = this.repo.page(params);
    const listed: ListedPage = { ...page, emptyReason: emptyReasonFor(page, params, this.#catalog.icons.length) };
    return listed;
  }
  async getIcon(id: IconId): Promise<Icon | null> {
    return this.repo.byId(id) ?? null;
  }
  async getSvg(icon: Icon, signal?: AbortSignal): Promise<string> {
    if (icon.svgContent) return icon.svgContent;
    if (icon.svgUrl) return getDefaultTransport().request<string>(icon.svgUrl, { raw: true, baseUrl: '', signal });
    return '';
  }
  async getFilters(): Promise<Filters> {
    return this.repo.filters();
  }
  async getStatistics(): Promise<Record<string, unknown>> {
    return this.#catalog.meta as unknown as Record<string, unknown>;
  }
  async getTree(): Promise<CategoryGroup[]> {
    // Static mode has the whole catalog in memory, so the tree stays filter-aware
    // -- unlike REST mode, it costs nothing to recompute per call. `undefined`
    // params intentionally mirror the "no active filter" default; callers that
    // want the live-filtered tree should keep using `IconRepository` directly, as
    // `useRepo` does today.
    return this.repo.categoryTree({ search: '', packages: [], categories: [], variants: [], page: 1, perPage: 0, sortBy: 'name', sortDirection: 'asc' });
  }
  async getRelated(icon: Icon, limit = 6): Promise<Icon[]> {
    return this.repo.related(icon, limit);
  }
  async getVariantCounts(params: ListParams): Promise<Map<string, number>> {
    return this.repo.variantCounts(params);
  }
  async getKindCounts(params: ListParams): Promise<Record<IconKind, number>> {
    return this.repo.kindCounts(params);
  }
}

/** The bootstrap document's REST map (`api.endpoints`), by key: `icons.list`, `icons.svg`... */
export type RestEndpoints = Readonly<Partial<Record<keyof Exclude<ApiManifest['endpoints'], unknown[]>, string>>>;

// ── REST adapter: the live Laravel API (envelope quirks absorbed here) ────────
export class RestCatalog implements IconCatalog {
  /**
   * `base` defaults to the transport config rather than to a literal, so there is
   * exactly one place a host sets its API root. Passing it explicitly still works
   * and wins, which is what the per-mount case needs.
   */
  readonly #base: string;
  /** Null: the default transport, read at each request, as before `RestCatalog.at()`. */
  #ownTransport: HttpTransport | null = null;
  /** The host's REST map, when given: each request goes to the URL it names. */
  #endpoints: RestEndpoints | null = null;

  constructor(base: string = getDefaultTransport().config.baseUrl) {
    this.#base = base;
  }

  /**
   * A REST catalog with its own transport, so two mounts can talk to two APIs (or use two
   * CSRF strategies) without sharing one. Starts from the
   * default transport's settings with `base` as the API root; chain to change the rest:
   *
   *   RestCatalog.at('/admin/ichava/api/v1').csrf('cookie').timeout(10_000)
   */
  static at(base: string): RestCatalog {
    return new RestCatalog(base).withTransport(getDefaultTransport().with({ baseUrl: base }));
  }

  /** The transport this catalog sends through. */
  get transport(): HttpTransport {
    return this.#ownTransport ?? getDefaultTransport();
  }

  /**
   * A REST catalog for a host's bootstrap REST map (`api` in `GET {prefix}/api/v1/bootstrap`):
   * every request goes to the URL the map names for it, and the API root is the map's
   * `base`. The transport default (`/ichava/api/v1`) is used only when the map has no base.
   *
   *   RestCatalog.fromApi((await loadHostContext(bootstrapUrl)).api!)
   */
  static fromApi(api: { base: string | null; endpoints: RestEndpoints | unknown[] }): RestCatalog {
    const base = api.base ?? getDefaultTransport().config.baseUrl;
    return RestCatalog.at(base).withEndpoints(api.endpoints);
  }

  /** The host's REST map this catalog reads its URLs from, or null when it builds them from its base. */
  get endpoints(): RestEndpoints | null {
    return this.#endpoints;
  }

  /** The same catalog sending through `transport`. */
  withTransport(transport: HttpTransport): RestCatalog {
    const next = new RestCatalog(this.#base);
    next.#ownTransport = transport;
    next.#endpoints = this.#endpoints;
    return next;
  }

  /**
   * The same catalog taking each URL from a host's REST map: `icons.list`, `icons.show`,
   * `icons.svg`, `icons.filters`, `icons.tree` and `icons.statistics`. A key the map lacks
   * falls back to this catalog's base. PHP's empty map (`[]`) means no endpoints.
   */
  withEndpoints(endpoints: RestEndpoints | unknown[]): RestCatalog {
    const next = this.withTransport(this.transport);
    next.#ownTransport = this.#ownTransport;
    next.#endpoints = Array.isArray(endpoints) ? {} : { ...endpoints };
    return next;
  }

  /** The same catalog with another CSRF strategy. */
  csrf(strategy: CsrfStrategy): RestCatalog {
    return this.withTransport(this.transport.with({ csrf: { strategy } }));
  }

  /** The same catalog with another request timeout, in milliseconds. */
  timeout(ms: number): RestCatalog {
    return this.withTransport(this.transport.with({ timeoutMs: ms }));
  }

  /** The same catalog with another fetch `credentials` mode. */
  credentials(mode: RequestCredentials): RestCatalog {
    return this.withTransport(this.transport.with({ credentials: mode }));
  }

  #request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
    return this.transport.request<T>(path, { ...opts, baseUrl: this.#base });
  }

  /**
   * One request, to the URL the host's REST map names under `key` when it has one (its
   * placeholders filled from `params`), else to `path` under this catalog's base.
   */
  #call<T>(key: keyof RestEndpoints, path: string, query: string, opts: RequestOpts = {}, params: Record<string, string | number> = {}): Promise<T> {
    const template = this.#endpoints?.[key];
    if (template) return this.transport.request<T>(`${fillTemplate(template, params)}${query}`, { ...opts, baseUrl: '' });
    return this.#request<T>(`${path}${query}`, opts);
  }

  async listIcons(params: ListParams, signal?: AbortSignal): Promise<PageResult<Icon>> {
    const raw = await this.#call<unknown>('icons.list', '/icons', buildQuery(paramsToQuery(params)), { signal });
    return normalizeIconList(raw, params);
  }
  async getIcon(id: IconId, signal?: AbortSignal): Promise<Icon | null> {
    const raw = await this.#call<Envelope<RawIcon>>('icons.show', `/icons/${id}`, '', { signal }, { iconId: id });
    return raw?.data ? withThemeVariants(toIcon(raw.data), raw.data) : null;
  }
  async getSvg(icon: Icon, signal?: AbortSignal): Promise<string> {
    return this.#call<string>('icons.svg', `/icons/${icon.id}/svg`, '', { raw: true, signal }, { iconId: icon.id });
  }
  async getFilters(signal?: AbortSignal): Promise<Filters> {
    // `filters` is a BARE object (no success wrapper).
    const raw = await this.#call<Partial<Filters> & { data?: Partial<Filters> }>('icons.filters', '/icons/filters', '', { signal });
    const f = (raw.data ?? raw) as Partial<Filters>;
    return { packages: (f.packages ?? []).map(toPackage), categories: f.categories ?? [], variants: f.variants ?? [] };
  }
  async getStatistics(signal?: AbortSignal): Promise<Record<string, unknown>> {
    const raw = await this.#call<Envelope<Record<string, unknown>> | Record<string, unknown>>('icons.statistics', '/icons/statistics', '', { signal });
    return (raw as Envelope<Record<string, unknown>>).data ?? (raw as Record<string, unknown>);
  }
  async getTree(signal?: AbortSignal): Promise<CategoryGroup[]> {
    return this.#tree('', signal);
  }
  /**
   * The tree counted over the current selection, so it agrees with the grid: the search,
   * packages, variant, kind, tags, keywords and language narrow it; the category and
   * subcategory selection does not, so every category stays visible to pick (as in
   * static mode). icon-browser's `/icons/tree` takes the same filters as `/icons`.
   */
  async getTreeFor(params: ListParams, signal?: AbortSignal): Promise<CategoryGroup[]> {
    return this.#tree(buildQuery(paramsToQuery(treeScope(params))), signal);
  }
  async #tree(query: string, signal?: AbortSignal): Promise<CategoryGroup[]> {
    const raw = await this.#call<Envelope<LaravelTreeNode[]> | LaravelTreeNode[]>('icons.tree', '/icons/tree', query, { signal });
    const nodes = Array.isArray(raw) ? raw : ((raw as Envelope<LaravelTreeNode[]>).data ?? []);
    return nodes.map(normalizeTreePackage);
  }
  /**
   * The installed packs, with the one the host opens on (`default`), and each pack's
   * variants with their translated labels and descriptions (`variants_by_package`), from
   * one `/icons/filters` call.
   */
  async getCatalogMeta(signal?: AbortSignal): Promise<CatalogMeta> {
    const raw = await this.#call<WireFilters & { data?: WireFilters }>('icons.filters', '/icons/filters', '', { signal });
    const f = raw.data ?? raw;
    return { packages: (f.packages ?? []).map(toPackage), variantsByPackage: toVariantMap(f.variants_by_package) };
  }
  async getRelated(icon: Icon, limit = 6, signal?: AbortSignal): Promise<Icon[]> {
    const { items } = await this.listIcons({ categories: [icon.category], page: 1, perPage: limit + 1 }, signal);
    return items.filter((i) => i.id !== icon.id).slice(0, limit);
  }
  async getVariantCounts(_params: ListParams, signal?: AbortSignal): Promise<Map<string, number>> {
    const filters = await this.getFilters(signal);
    // Keyed by slug (`v.name`), matching `IconRepository.variantCounts()`'s
    // static-mode keys -- `v.id` is `number | string` and, for a handful of
    // Laravel term rows, numeric, which would silently break lookups keyed by
    // the variant slug string everywhere else in the app.
    return new Map(filters.variants.map((v) => [v.name, v.count]));
  }
  async getKindCounts(params: ListParams, signal?: AbortSignal): Promise<Record<IconKind, number>> {
    // `/icons/filters` counts each facet over the OTHER filters, so the kind facet comes
    // back for both kinds whichever one is selected.
    const { kind: _kind, page: _page, perPage: _perPage, sortBy: _sortBy, sortDirection: _sortDirection, ...rest } = params;
    const raw = await this.#call<{ kinds?: { name: string; count: number }[]; data?: { kinds?: { name: string; count: number }[] } }>(
      'icons.filters',
      '/icons/filters',
      buildQuery(paramsToQuery(rest)),
      { signal },
    );
    const kinds = raw.data?.kinds ?? raw.kinds ?? [];
    const counts: Record<IconKind, number> = { icon: 0, illustration: 0 };
    for (const k of kinds) if (k.name === 'icon' || k.name === 'illustration') counts[k.name] = k.count;
    return counts;
  }
}

// ── pack and variant metadata ────────────────────────────────────────────────

/** An installed pack as the catalog lists it, plus whether the host opens on it. */
export interface PackageMeta extends IconPackage {
  /** The pack the host opens on (core's default set). */
  default?: boolean;
  kind?: IconKind;
}

/** One of a pack's variants as the variant picker shows it (core's `VariantData`). */
export interface VariantMeta {
  slug: string;
  label: string;
  /** The pack's translated description of the variant; empty when it ships none. */
  description: string;
  default: boolean;
}

/** What `getCatalogMeta` reads: the packs and, per pack, its variants. */
export interface CatalogMeta {
  packages: PackageMeta[];
  variantsByPackage: Readonly<Record<string, VariantMeta[]>>;
}

interface WirePackage {
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  count?: number;
  installed?: boolean;
  loaded?: boolean;
  kind?: IconKind;
  default?: boolean;
}

interface WireFilters {
  packages?: WirePackage[];
  variants_by_package?: unknown;
}

/**
 * icon-browser's pack row (`name`, `label`, `count`, `description`, `kind`, `default`) as
 * the catalog's `IconPackage`. A row already in that shape (`id`) passes through.
 */
function toPackage(p: WirePackage | IconPackage): PackageMeta {
  const w = p as WirePackage;
  const id = String(w.id ?? w.name ?? '');
  return {
    id,
    label: w.label ?? id,
    ...(w.description ? { description: w.description } : {}),
    count: typeof w.count === 'number' ? w.count : 0,
    installed: w.installed ?? true,
    loaded: w.loaded ?? true,
    ...(w.kind === 'icon' || w.kind === 'illustration' ? { kind: w.kind } : {}),
    ...(w.default === true ? { default: true } : {}),
  };
}

function toVariantMap(raw: unknown): Record<string, VariantMeta[]> {
  // PHP sends an empty map as [].
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, VariantMeta[]> = {};
  for (const [pack, list] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(list)) continue;
    out[pack] = list
      .filter((v): v is Record<string, unknown> => !!v && typeof v === 'object' && typeof (v as { slug?: unknown }).slug === 'string')
      .map((v) => ({
        slug: String(v.slug),
        label: typeof v.label === 'string' && v.label ? v.label : String(v.slug),
        description: typeof v.description === 'string' ? v.description : '',
        default: v.default === true,
      }));
  }
  return out;
}

/** The selection a filter-aware tree is counted over: everything but categories, subs, paging and sort. */
function treeScope(p: ListParams): ListParams {
  const { categories: _c, subs: _s, page: _p, perPage: _pp, sortBy: _sb, sortDirection: _sd, ...rest } = p;
  return rest;
}

// ── tree normalization (Laravel's shape differs from CategoryGroup) ──────────
//
// `IconBrowserService::buildIconTree()` returns a filesystem-scan structure --
// {id, type:'package', name, title, icon_count, children:[{id, type:'folder',
// name, label, path, icon_count, package, depth, children}]} -- not the same
// shape `IconRepository.categoryTree` produces. Normalized here so both
// adapters hand callers the identical `CategoryGroup[]` contract.
//
// `path` (the folder's absolute server filesystem path) is read and discarded,
// never forwarded: the field exists in the Laravel response purely as a
// scanning artifact and has no legitimate reason to reach a client.
interface LaravelTreeNode {
  id: string;
  type: 'package' | 'folder';
  name: string;
  title?: string;
  label?: string;
  icon_count: number;
  children?: LaravelTreeNode[];
}

function normalizeTreePackage(pkg: LaravelTreeNode): CategoryGroup {
  const cats = (pkg.children ?? []).map(normalizeTreeCategory);
  return { pack: pkg.id, label: pkg.title ?? pkg.name, count: cats.length, cats };
}

function normalizeTreeCategory(node: LaravelTreeNode): CategoryGroup['cats'][number] {
  const sub = (node.children ?? []).map((c) => ({ slug: c.name, name: c.label ?? c.name, count: c.icon_count }));
  return { name: node.name, count: node.icon_count, sub: sub.length ? sub : undefined };
}

// ── envelope normalization (ADPT-A) ──────────────────────────────────────────
function normalizeIconList(raw: unknown, params: ListParams): ListedPage {
  const r = (raw ?? {}) as Record<string, unknown>;
  const dataField = r.data ?? r;
  let rawItems: RawIcon[];
  if (Array.isArray(dataField)) rawItems = dataField as RawIcon[];
  else if (dataField && typeof dataField === 'object') {
    rawItems = Object.entries(dataField as Record<string, unknown>)
      .filter(([k]) => k !== 'grouped' && /^\d+$/.test(k))
      .map(([, v]) => v as RawIcon);
  } else rawItems = [];

  const meta = (r.meta ?? {}) as Record<string, unknown>;
  const perPage = extractNumber(meta.per_page, params.perPage ?? rawItems.length);
  const total = extractNumber(meta.total, rawItems.length);
  const page = extractNumber(meta.current_page, params.page ?? 1);
  const lastPage = extractNumber(meta.last_page, Math.max(1, Math.ceil(total / Math.max(1, perPage))));
  const from = extractNumber(meta.from, total ? (page - 1) * perPage + 1 : 0);
  const to = extractNumber(meta.to, Math.min(page * perPage, total));
  const reason = meta.empty_reason;
  const emptyReason: EmptyReason = reason === 'no_match' || reason === 'no_icons' ? reason : null;
  return { items: rawItems.map((r) => withThemeVariants(toIcon(r), r)), total, page, perPage, lastPage, rangeStart: from, rangeEnd: to, emptyReason };
}

/** meta values may be array-valued (grouping) → take [0]. */
function extractNumber(v: unknown, fallback: number): number {
  if (Array.isArray(v)) v = v[0];
  const n = typeof v === 'string' ? parseInt(v, 10) : (v as number);
  return Number.isFinite(n) ? (n as number) : fallback;
}

function paramsToQuery(p: ListParams): Record<string, unknown> {
  return {
    search: p.search,
    'packages': p.packages,
    'categories': p.categories,
    'subs': p.subs,
    'variants': p.variants,
    kind: p.kind,
    'tags': p.tags,
    'keywords': p.keywords,
    language: p.language,
    page: p.page,
    per_page: p.perPage,
    sort_by: p.sortBy,
    sort_direction: p.sortDirection,
  };
}

export function buildQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    if (Array.isArray(v)) v.forEach((x) => sp.append(`${k}[]`, String(x)));
    else sp.append(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export type DataSourceKind = 'static' | 'rest';

export function createCatalog(kind: DataSourceKind, opts: { catalog?: Catalog; base?: string }): IconCatalog {
  if (kind === 'rest') return new RestCatalog(opts.base);
  if (!opts.catalog) throw new Error('StaticCatalog requires a bundled catalog');
  return new StaticCatalog(opts.catalog);
}
