import { describe, expect, it } from 'vitest';

import { IconQuery, type IconFilters } from './IconQuery';

/**
 * IconQuery: the filter state as an immutable value. Each transition keeps the semantics
 * of the store action it replaces (store.ts, filter actions): search, package, category,
 * variant and per-page changes go back to page 1; sort and paging do not; choosing the
 * selected variant again clears it.
 */

const BASE: IconFilters = {
  search: '',
  packages: ['ichava/icon-sets-tabler'],
  categories: [],
  subs: [],
  variant: null,
  sortBy: 'name',
  sortOrder: 'asc',
  page: 4,
  perPage: 48,
};
const q = () => IconQuery.from(BASE);

describe('IconQuery', () => {
  it('is immutable: a transition returns a new query and leaves the old one alone', () => {
    const a = q();
    const b = a.search('arrow');
    expect(b).not.toBe(a);
    expect(a.toFilters()).toEqual(BASE);
    expect(Object.isFrozen(a)).toBe(true);
    expect(Object.isFrozen(b.toFilters().packages)).toBe(false);
  });

  it('search and clearSearch reset to page 1', () => {
    expect(q().search('arrow').toFilters()).toEqual({ ...BASE, search: 'arrow', page: 1 });
    expect(q().search('arrow').page(3).clearSearch().toFilters()).toEqual({ ...BASE, page: 1 });
  });

  it('togglePackage adds and removes, resetting the page', () => {
    expect(q().togglePackage('ichava/icon-sets-flag').toFilters().packages).toEqual(['ichava/icon-sets-tabler', 'ichava/icon-sets-flag']);
    expect(q().togglePackage('ichava/icon-sets-tabler').toFilters()).toEqual({ ...BASE, packages: [], page: 1 });
  });

  it('selectAllPacks and clearPacks reset the page', () => {
    expect(q().selectAllPacks(['a', 'b']).toFilters()).toEqual({ ...BASE, packages: ['a', 'b'], page: 1 });
    expect(q().clearPacks().toFilters()).toEqual({ ...BASE, packages: [], page: 1 });
  });

  it('toggleCategory, toggleSub and clearCategories', () => {
    const c = q().toggleCategory('arrows');
    expect(c.toFilters()).toEqual({ ...BASE, categories: ['arrows'], page: 1 });
    expect(c.toggleCategory('arrows').toFilters().categories).toEqual([]);
    const s = q().toggleSub('arrows', 'circle');
    expect(s.toFilters().subs).toEqual(['arrows/circle']);
    expect(s.toggleSub('arrows', 'circle').toFilters().subs).toEqual([]);
    expect(c.toggleSub('arrows', 'circle').page(2).clearCategories().toFilters()).toEqual({ ...BASE, page: 1 });
  });

  it('toggleVariant selects, and clears when the same variant is chosen again', () => {
    expect(q().toggleVariant('outline').toFilters()).toEqual({ ...BASE, variant: 'outline', page: 1 });
    expect(q().toggleVariant('outline').toggleVariant('outline').toFilters().variant).toBeNull();
    expect(q().toggleVariant('outline').toggleVariant('filled').toFilters().variant).toBe('filled');
  });

  it('sortBy and toggleOrder keep the page', () => {
    expect(q().sortBy('package').toFilters()).toEqual({ ...BASE, sortBy: 'package' });
    expect(q().toggleOrder().toFilters().sortOrder).toBe('desc');
    expect(q().toggleOrder().toggleOrder().toFilters().sortOrder).toBe('asc');
  });

  it('page, nextPage (capped), prevPage (floored) and perPage', () => {
    expect(q().page(7).toFilters().page).toBe(7);
    expect(q().nextPage(5).toFilters().page).toBe(5);
    expect(q().nextPage(4).toFilters().page).toBe(4);
    expect(q().page(1).prevPage().toFilters().page).toBe(1);
    expect(q().prevPage().toFilters().page).toBe(3);
    expect(q().perPage(96).toFilters()).toEqual({ ...BASE, perPage: 96, page: 1 });
  });

  it('reset returns to the defaults, keeping the chosen packages', () => {
    const defaults: IconFilters = { ...BASE, packages: [], page: 1, perPage: 120, sortBy: 'name' };
    const dirty = q().search('x').toggleCategory('c').toggleVariant('outline').perPage(24);
    expect(dirty.reset(defaults).toFilters()).toEqual({ ...defaults, packages: BASE.packages });
  });

  it('maps to the catalog list parameters, a single variant becoming a list', () => {
    expect(q().toggleVariant('outline').toListParams()).toEqual({
      search: '',
      packages: ['ichava/icon-sets-tabler'],
      categories: [],
      subs: [],
      variants: ['outline'],
      page: 1,
      perPage: 48,
      sortBy: 'name',
      sortDirection: 'asc',
    });
    expect(q().toListParams().variants).toEqual([]);
  });

  it('chains', () => {
    const f = IconQuery.from(BASE).search('arrow').togglePackage('ichava/icon-sets-flag').toggleVariant('outline').sortBy('name').page(2).toFilters();
    expect(f).toEqual({ ...BASE, search: 'arrow', packages: ['ichava/icon-sets-tabler', 'ichava/icon-sets-flag'], variant: 'outline', page: 2 });
  });
});
