import type { Catalog, CategoryGroup } from '../../modules/catalog';
import { type Filters, type Icon, type IconId, type ListParams, type PageResult } from '@ichava/js-ui-kernel';
export type { ListParams };
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
}
export declare class RestCatalog implements IconCatalog {
    #private;
    constructor(base?: string);
    /**
     * A REST catalog with its own transport, so two mounts can talk to two APIs (or use two
     * CSRF strategies) without sharing one. Starts from the
     * default transport's settings with `base` as the API root; chain to change the rest:
     *
     *   RestCatalog.at('/admin/ichava/api').csrf('cookie').timeout(10_000)
     */
    static at(base: string): RestCatalog;
    /** The transport this catalog sends through. */
    get transport(): HttpTransport;
    /** The same catalog sending through `transport`. */
    withTransport(transport: HttpTransport): RestCatalog;
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
    getRelated(icon: Icon, limit?: number, signal?: AbortSignal): Promise<Icon[]>;
    getVariantCounts(_params: ListParams, signal?: AbortSignal): Promise<Map<string, number>>;
}
export declare function buildQuery(params: Record<string, unknown>): string;
export type DataSourceKind = 'static' | 'rest';
export declare function createCatalog(kind: DataSourceKind, opts: {
    catalog?: Catalog;
    base?: string;
}): IconCatalog;
