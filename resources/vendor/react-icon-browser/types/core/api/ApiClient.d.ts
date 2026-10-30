import type { Catalog, CategoryGroup, ListParams } from '../../modules/catalog';
import { type Filters, type Icon, type IconId, type IconKind, type IconPackage, type PageResult } from '@ichava/js-ui-kernel';
import type { ApiManifest, EmptyReason } from './schema.gen';
export type { ListParams };
/**
 * A page, plus why it is empty when it is: `no_match` (the filters exclude everything)
 * or `no_icons` (nothing is installed or seeded). Static mode works it out itself; REST
 * mode reads icon-browser's `meta.empty_reason`.
 */
export type ListedPage = PageResult<Icon> & {
    emptyReason?: EmptyReason;
};
/** Why a page came back empty, worked out the way icon-browser does. */
export declare function emptyReasonFor(page: PageResult<Icon>, params: ListParams, catalogSize: number): EmptyReason;
import { type CsrfStrategy, type HttpTransport } from './httpClient';
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
export declare class StaticCatalog implements IconCatalog {
    #private;
    private readonly repo;
    constructor(catalog: Catalog);
    listIcons(params: ListParams): Promise<PageResult<Icon>>;
    getIcon(id: IconId): Promise<Icon | null>;
    getSvg(icon: Icon, signal?: AbortSignal): Promise<string>;
    getFilters(): Promise<Filters>;
    getStatistics(): Promise<Record<string, unknown>>;
    getTree(): Promise<CategoryGroup[]>;
    getRelated(icon: Icon, limit?: number): Promise<Icon[]>;
    getVariantCounts(params: ListParams): Promise<Map<string, number>>;
    getKindCounts(params: ListParams): Promise<Record<IconKind, number>>;
}
/** The bootstrap document's REST map (`api.endpoints`), by key: `icons.list`, `icons.svg`... */
export type RestEndpoints = Readonly<Partial<Record<keyof Exclude<ApiManifest['endpoints'], unknown[]>, string>>>;
export declare class RestCatalog implements IconCatalog {
    #private;
    constructor(base?: string);
    /**
     * A REST catalog with its own transport, so two mounts can talk to two APIs (or use two
     * CSRF strategies) without sharing one. Starts from the
     * default transport's settings with `base` as the API root; chain to change the rest:
     *
     *   RestCatalog.at('/admin/ichava/api/v1').csrf('cookie').timeout(10_000)
     */
    static at(base: string): RestCatalog;
    /** The transport this catalog sends through. */
    get transport(): HttpTransport;
    /**
     * A REST catalog for a host's bootstrap REST map (`api` in `GET {prefix}/api/v1/bootstrap`):
     * every request goes to the URL the map names for it, and the API root is the map's
     * `base`. The transport default (`/ichava/api/v1`) is used only when the map has no base.
     *
     *   RestCatalog.fromApi((await loadHostContext(bootstrapUrl)).api!)
     */
    static fromApi(api: {
        base: string | null;
        endpoints: RestEndpoints | unknown[];
    }): RestCatalog;
    /** The host's REST map this catalog reads its URLs from, or null when it builds them from its base. */
    get endpoints(): RestEndpoints | null;
    /** The same catalog sending through `transport`. */
    withTransport(transport: HttpTransport): RestCatalog;
    /**
     * The same catalog taking each URL from a host's REST map: `icons.list`, `icons.show`,
     * `icons.svg`, `icons.filters`, `icons.tree` and `icons.statistics`. A key the map lacks
     * falls back to this catalog's base. PHP's empty map (`[]`) means no endpoints.
     */
    withEndpoints(endpoints: RestEndpoints | unknown[]): RestCatalog;
    /** The same catalog with another CSRF strategy. */
    csrf(strategy: CsrfStrategy): RestCatalog;
    /** The same catalog with another request timeout, in milliseconds. */
    timeout(ms: number): RestCatalog;
    /** The same catalog with another fetch `credentials` mode. */
    credentials(mode: RequestCredentials): RestCatalog;
    listIcons(params: ListParams, signal?: AbortSignal): Promise<PageResult<Icon>>;
    getIcon(id: IconId, signal?: AbortSignal): Promise<Icon | null>;
    getSvg(icon: Icon, signal?: AbortSignal): Promise<string>;
    getFilters(signal?: AbortSignal): Promise<Filters>;
    getStatistics(signal?: AbortSignal): Promise<Record<string, unknown>>;
    getTree(signal?: AbortSignal): Promise<CategoryGroup[]>;
    /**
     * The tree counted over the current selection, so it agrees with the grid: the search,
     * packages, variant, kind, tags, keywords and language narrow it; the category and
     * subcategory selection does not, so every category stays visible to pick (as in
     * static mode). icon-browser's `/icons/tree` takes the same filters as `/icons`.
     */
    getTreeFor(params: ListParams, signal?: AbortSignal): Promise<CategoryGroup[]>;
    /**
     * The installed packs, with the one the host opens on (`default`), and each pack's
     * variants with their translated labels and descriptions (`variants_by_package`), from
     * one `/icons/filters` call.
     */
    getCatalogMeta(signal?: AbortSignal): Promise<CatalogMeta>;
    getRelated(icon: Icon, limit?: number, signal?: AbortSignal): Promise<Icon[]>;
    getVariantCounts(_params: ListParams, signal?: AbortSignal): Promise<Map<string, number>>;
    getKindCounts(params: ListParams, signal?: AbortSignal): Promise<Record<IconKind, number>>;
}
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
export declare function buildQuery(params: Record<string, unknown>): string;
export type DataSourceKind = 'static' | 'rest';
export declare function createCatalog(kind: DataSourceKind, opts: {
    catalog?: Catalog;
    base?: string;
}): IconCatalog;
