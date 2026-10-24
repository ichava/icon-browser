import type { Catalog, Filters, Icon, IconId, ListParams, PageResult } from '@ichava/js-ui-kernel';
/** Bundled static catalog shape (StaticCatalog input): the kernel's type. */
export type { Catalog };
/**
 * CatalogIndex (formerly IconRepository) — the single search/filter/sort/paginate + tree selector over a
 * bundled catalog. Pure + framework-agnostic. In REST mode the server does this;
 * in static mode this reproduces the same contract so both paths agree.
 */
export declare class CatalogIndex {
    #private;
    constructor(catalog: Catalog);
    private matches;
    filtered(p: ListParams): Icon[];
    page(p: ListParams): PageResult<Icon>;
    byId(id: IconId): Icon | undefined;
    related(icon: Icon, limit?: number): Icon[];
    /** Bare `filters` contract: packages + category terms + variant terms with counts. */
    filters(): Filters;
    /** Variant term counts over the current package/search scope (ignores the variant filter). */
    variantCounts(p: ListParams): Map<string, number>;
    /**
     * Category tree grouped pack → category → subcategory. Counts ignore the
     * category/variant selection so they stay stable. A category's `count` is all
     * its icons (direct + subs); a group's `count` is its NUMBER OF CATEGORIES.
     */
    categoryTree(p: ListParams): CategoryGroup[];
}
export interface SubNode {
    slug: string;
    name: string;
    count: number;
}
export interface CategoryNode {
    name: string;
    count: number;
    /** Present only when the category has subcategories; `categoryTree()` writes `undefined` otherwise. */
    sub?: SubNode[] | undefined;
}
export interface CategoryGroup {
    pack: string;
    label: string;
    /** Number of categories in this package (matches the reference badge). */
    count: number;
    cats: CategoryNode[];
}
