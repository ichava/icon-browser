import type { Icon, IconId, ListParams, PageResult } from '@ichava/js-ui-kernel';
/** The part of a catalog source this needs: the paginated listing every source offers. */
export interface IconLister {
    listIcons(params: ListParams): Promise<PageResult<Icon>>;
}
/**
 * Every icon id matching `params`' search and filters, in listing order, whatever page
 * the user is on. Walks the source's pages from the first to `lastPage`, so it works for a
 * bundled catalog and a REST API alike, including a server that caps the page size.
 * Select all uses it.
 */
export declare function matchingIconIds(source: IconLister, params: ListParams, pageSize?: number): Promise<IconId[]>;
