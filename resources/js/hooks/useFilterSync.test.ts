import { describe, expect, it } from 'vitest';
import { echoToQuery, listParamsToQuery, queryKey, seedFilters, toQueryParams } from './useFilterSync';
import type { FilterState } from '@/lib/browser';

const base = (overrides: Partial<FilterState> = {}): FilterState =>
  ({
    search: '',
    packages: [],
    categories: [],
    subs: [],
    variant: null,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    perPage: 60,
    ...overrides,
  }) as FilterState;

describe('toQueryParams', () => {
  it('omits empty filters so the URL stays clean', () => {
    expect(toQueryParams(base())).toEqual({
      search: undefined,
      packages: undefined,
      categories: undefined,
      variants: undefined,
      sort_by: 'name',
      sort_direction: 'asc',
      page: 1,
      per_page: 60,
    });
  });

  it('drops sub-minimum search queries the server would reject', () => {
    expect(toQueryParams(base({ search: 'a' })).search).toBeUndefined();
    expect(toQueryParams(base({ search: 'ab' })).search).toBe('ab');
  });

  it('maps the single client variant onto the server array', () => {
    expect(toQueryParams(base({ variant: 'filled' })).variants).toEqual(['filled']);
  });

  it('clamps per_page to the server maximum', () => {
    expect(toQueryParams(base({ perPage: 240 })).per_page).toBe(120);
  });
});

describe('toQueryParams lower bound', () => {
  it('clamps per_page to the server minimum', () => {
    // IconFilterRequest: per_page min:10. Below it the visit bounced a validation error.
    expect(toQueryParams(base({ perPage: 6 })).per_page).toBe(10);
  });
});

describe('listParamsToQuery', () => {
  it('builds the same query from the library ListParams as from the store filters', () => {
    const f = base({ search: 'arrow', packages: ['ichava/icon-sets-tabler'], variant: 'filled', page: 3, perPage: 48 });
    const params = {
      search: f.search,
      packages: f.packages,
      categories: f.categories,
      subs: f.subs,
      variants: f.variant ? [f.variant] : [],
      page: f.page,
      perPage: f.perPage,
      sortBy: f.sortBy,
      sortDirection: f.sortOrder,
    };
    expect(listParamsToQuery(params)).toEqual(toQueryParams(f));
  });

  it('does not send subcategories, which IconFilterRequest does not accept', () => {
    expect(listParamsToQuery({ subs: ['arrows/up'] })).not.toHaveProperty('subs');
  });
});

describe('echoToQuery and queryKey', () => {
  it('reads a server echo of the default filters as the default query', () => {
    const echo = { search: null, packages: [], categories: [], variants: [], sort_by: 'name', sort_direction: 'asc', page: 1, per_page: 60 };
    expect(queryKey(echoToQuery(echo))).toBe(queryKey(toQueryParams(base())));
  });

  it('treats an empty echo (the controller error path) as no echo', () => {
    expect(echoToQuery({})).toBeNull();
    expect(queryKey(null)).toBe('');
  });
});

describe('seedFilters', () => {
  it('maps the echo onto the store filter shape', () => {
    expect(seedFilters({ search: 'ab', variants: ['solid', 'outline'], sort_by: 'created_at', sort_direction: 'desc', page: 2, per_page: 24 })).toEqual({
      search: 'ab',
      packages: [],
      categories: [],
      variant: 'solid',
      sortBy: 'name',
      sortOrder: 'desc',
      page: 2,
      perPage: 24,
    });
  });
});
