import { describe, expect, it } from 'vitest';
import { CatalogIndex as IconRepository } from '@/modules/catalog';
import { catalog, mkIcon } from '@/test/fixtures';
import type { Catalog } from '@/modules/catalog';

const repo = new IconRepository(catalog);

// A catalog with subcategories + a color variant for the tree/variant tests.
const subCatalog: Catalog = {
  meta: { total_ecosystem: 10, generated: '2026-01-01' },
  packages: [{ id: 'ichava/icon-sets-tabler', label: 'tabler-icons', count: 5, installed: true, loaded: true }],
  icons: [
    mkIcon({ id: 1, name: 'settings', category: 'system' }), // direct (no sub)
    mkIcon({ id: 2, name: 'wifi', category: 'system', sub: 'connectivity' }),
    mkIcon({ id: 3, name: 'bluetooth', category: 'system', sub: 'connectivity' }),
    mkIcon({ id: 4, name: 'cpu', category: 'system', sub: 'hardware' }),
    mkIcon({ id: 5, name: 'palette', category: 'design', variant: 'color', ownColor: true }),
  ],
};
const subRepo = new IconRepository(subCatalog);

describe('IconRepository', () => {
  it('paginates with a stable range', () => {
    const p = repo.page({ perPage: 2, page: 1 });
    expect(p.total).toBe(5);
    expect(p.items).toHaveLength(2);
    expect(p.lastPage).toBe(3);
    expect(p.rangeStart).toBe(1);
    expect(p.rangeEnd).toBe(2);
  });

  it('clamps an out-of-range page', () => {
    const p = repo.page({ perPage: 2, page: 99 });
    expect(p.page).toBe(3);
    expect(p.items).toHaveLength(1);
  });

  it('filters by package, category and variant', () => {
    expect(repo.page({ packages: ['ichava/ui-icons'] }).total).toBe(1);
    expect(repo.page({ categories: ['communication'] }).total).toBe(2);
    expect(repo.page({ variants: ['filled'] }).total).toBe(1);
  });

  it('searches name + tags (min 2 chars)', () => {
    expect(repo.page({ search: 'account' }).items.map((i) => i.name)).toEqual(['user']);
    expect(repo.page({ search: 'a' }).total).toBe(5); // <2 chars → ignored
  });

  it('sorts by name asc/desc', () => {
    expect(repo.page({ sortBy: 'name', sortDirection: 'asc' }).items[0]!.name).toBe('bell');
    expect(repo.page({ sortBy: 'name', sortDirection: 'desc' }).items[0]!.name).toBe('user');
  });

  it('builds a category tree grouped by pack with stable counts', () => {
    const tree = repo.categoryTree({ categories: ['communication'] });
    const tabler = tree.find((g) => g.pack === 'ichava/icon-sets-tabler')!;
    // counts ignore the category filter so the tree stays browsable
    expect(tabler.cats.find((c) => c.name === 'general')!.count).toBe(2);
    expect(tabler.cats.find((c) => c.name === 'communication')!.count).toBe(2);
  });

  it('exposes filters with counts', () => {
    const f = repo.filters();
    expect(f.categories.find((c) => c.name === 'general')!.count).toBe(2);
    expect(f.variants.map((v) => v.name).sort()).toEqual(['filled', 'outline']);
  });

  it('finds related same-category icons', () => {
    const home = repo.byId(1)!;
    expect(repo.related(home).map((i) => i.name)).toEqual(['user']);
  });

  it('relates icons by shared words and pack, not by a category shared across packs', () => {
    // "general" spans packs: tabler's accessible used to list Andorra's flag as related.
    const mixed = new IconRepository({
      meta: { total_ecosystem: 5, generated: '2026-01-01' },
      packages: [],
      icons: [
        mkIcon({ id: 1, name: 'accessible', category: 'general', package: 'ichava/icon-sets-tabler', variant: 'outline' }),
        mkIcon({ id: 2, name: 'flag-ad', category: 'general', package: 'ichava/icon-sets-flag' }),
        mkIcon({ id: 3, name: 'accessible', category: 'general', package: 'ichava/icon-sets-tabler', variant: 'filled' }),
        mkIcon({ id: 4, name: 'wheelchair', category: 'health', package: 'ichava/icon-sets-lucide', tags: ['accessible'] }),
        mkIcon({ id: 5, name: 'home', category: 'general', package: 'ichava/icon-sets-tabler' }),
      ],
    });
    const names = mixed.related(mixed.byId(1)!).map((i) => `${i.package.split('-').pop()}:${i.name}`);
    expect(names).toEqual(['tabler:accessible', 'lucide:wheelchair', 'tabler:home']);
  });

  it('builds a 3-level tree; package count = number of categories', () => {
    const tree = subRepo.categoryTree({});
    const g = tree[0]!;
    expect(g.count).toBe(2); // system + design = 2 categories
    const system = g.cats.find((c) => c.name === 'system')!;
    expect(system.count).toBe(4); // 1 direct + 3 in subs
    expect(system.sub!.map((s) => s.slug).sort()).toEqual(['connectivity', 'hardware']);
    expect(system.sub!.find((s) => s.slug === 'connectivity')!.count).toBe(2);
    expect(system.sub!.find((s) => s.slug === 'hardware')!.count).toBe(1);
    expect(g.cats.find((c) => c.name === 'design')!.sub).toBeUndefined();
  });

  it('filters by subcategory (category/sub key) OR whole category', () => {
    expect(subRepo.page({ subs: ['system/connectivity'] }).total).toBe(2);
    expect(subRepo.page({ categories: ['system'] }).total).toBe(4);
    // categories + subs union within the category dimension
    expect(subRepo.page({ categories: ['design'], subs: ['system/hardware'] }).total).toBe(2);
  });

  it('reports variant counts over the current scope', () => {
    const vc = subRepo.variantCounts({});
    expect(vc.get('outline')).toBe(4);
    expect(vc.get('color')).toBe(1);
    expect(vc.get('filled') ?? 0).toBe(0);
  });
});
