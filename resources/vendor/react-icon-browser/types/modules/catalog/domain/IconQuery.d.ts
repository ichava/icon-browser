import type { ListParams } from '@ichava/js-ui-kernel';
export type SortKey = 'name' | 'package' | 'category';
export type SortOrder = 'asc' | 'desc';
/** The browser's filter state: what the user has chosen to search, filter and page by. */
export interface IconFilters {
    search: string;
    packages: string[];
    categories: string[];
    /** subcategory keys, `category/sub` (globally unique). */
    subs: string[];
    variant: string | null;
    sortBy: SortKey;
    sortOrder: SortOrder;
    page: number;
    perPage: number;
}
/**
 * The filter state as an immutable value object (architecture.md 3.4).
 *
 * Every transition returns a new query, so a sequence of choices can be composed and
 * tested without a store:
 *
 *   IconQuery.from(filters).search('arrow').togglePackage(pkg).toggleVariant('outline').page(2)
 *
 * The rules are the ones the store's filter actions applied inline: a change to what is
 * searched or filtered, or to the page size, goes back to page 1; sorting and paging do
 * not; choosing the selected variant again clears it.
 */
export declare class IconQuery {
    #private;
    private constructor();
    static from(filters: IconFilters): IconQuery;
    search(value: string): IconQuery;
    clearSearch(): IconQuery;
    togglePackage(id: string): IconQuery;
    selectAllPacks(all: string[]): IconQuery;
    clearPacks(): IconQuery;
    toggleCategory(name: string): IconQuery;
    toggleSub(category: string, sub: string): IconQuery;
    clearCategories(): IconQuery;
    /** Select a variant; choosing the selected one again, or null, clears it. */
    toggleVariant(variant: string | null): IconQuery;
    sortBy(key: SortKey): IconQuery;
    toggleOrder(): IconQuery;
    page(n: number): IconQuery;
    /** The next page, never beyond `max`. */
    nextPage(max: number): IconQuery;
    /** The previous page, never below 1. */
    prevPage(): IconQuery;
    perPage(n: number): IconQuery;
    /** Back to `defaults`, keeping the packages the user chose. */
    reset(defaults: IconFilters): IconQuery;
    /** The plain filter state, as the store holds and persists it. */
    toFilters(): IconFilters;
    /** The catalog list parameters: one selected variant becomes a one-item list. */
    toListParams(): ListParams;
}
