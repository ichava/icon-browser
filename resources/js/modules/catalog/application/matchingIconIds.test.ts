import { describe, expect, it } from 'vitest';
import type { Icon, ListParams, PageResult } from '@ichava/js-ui-kernel';

import { StaticCatalog } from '@/core/api/ApiClient';
import { catalog } from '@/test/fixtures';
import { CatalogIndex } from '../domain/CatalogIndex';
import { matchingIconIds, type IconLister } from './matchingIconIds';

/** A lister over N icons that serves pages of at most `cap`, as a server capping per_page does. */
function fakeLister(n: number, cap: number) {
  const calls: ListParams[] = [];
  const lister: IconLister = {
    async listIcons(params) {
      calls.push(params);
      const per = Math.min(params.perPage ?? cap, cap);
      const page = params.page ?? 1;
      const ids = Array.from({ length: n }, (_, i) => i + 1).slice((page - 1) * per, page * per);
      const result: PageResult<Icon> = {
        items: ids.map((id) => ({ id }) as Icon),
        total: n,
        page,
        perPage: per,
        lastPage: Math.max(1, Math.ceil(n / per)),
        rangeStart: 0,
        rangeEnd: 0,
      };
      return result;
    },
  };
  return { lister, calls };
}

describe('matchingIconIds', () => {
  it('collects every matching id across pages, keeping the filter and ignoring the visible page', async () => {
    const { lister, calls } = fakeLister(1234, 200);
    const ids = await matchingIconIds(lister, { search: 'arrow', page: 3, perPage: 48 });
    expect(ids).toHaveLength(1234);
    expect(new Set(ids).size).toBe(1234);
    expect(calls).toHaveLength(7);
    expect(calls.every((c) => c.search === 'arrow')).toBe(true);
    expect(calls.map((c) => c.page)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('stops on an empty page', async () => {
    const { lister } = fakeLister(0, 200);
    expect(await matchingIconIds(lister, {})).toEqual([]);
  });

  it('selects the whole filtered static catalog, not one page of it', async () => {
    const params: ListParams = { packages: [], page: 1, perPage: 2 };
    const all = new CatalogIndex(catalog).page({ ...params, perPage: catalog.icons.length });
    expect(all.total).toBeGreaterThan(2);
    const ids = await matchingIconIds(new StaticCatalog(catalog), params);
    expect(ids).toEqual(all.items.map((i) => i.id));
  });
});
