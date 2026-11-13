import type { Icon, IconId, PageResult } from '@ichava/js-ui-kernel';
import type { ListParams } from '../domain/listParams';

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
export async function matchingIconIds(source: IconLister, params: ListParams, pageSize = 500): Promise<IconId[]> {
  const ids: IconId[] = [];
  for (let page = 1; ; page += 1) {
    const result = await source.listIcons({ ...params, page, perPage: pageSize });
    for (const icon of result.items) ids.push(icon.id);
    if (result.items.length === 0 || page >= result.lastPage) return ids;
  }
}
