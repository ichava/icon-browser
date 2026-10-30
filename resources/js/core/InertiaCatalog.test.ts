import { describe, expect, it, vi } from 'vitest';
import { InertiaCatalog, type BrowserSnapshot, type VisitFn } from './InertiaCatalog';
import type { ServerIcon } from './propsToCatalog';

const icon = (id: number, overrides: Partial<ServerIcon> = {}): ServerIcon => ({
  id,
  package: 'ichava/icon-sets-tabler',
  name: `icon-${id}`,
  category: 'arrows',
  variant: 'outline',
  svg_content: '<svg viewBox="0 0 24 24"><path d="M0 0h24"/></svg>',
  ...overrides,
});

const echo = { search: null, packages: [], categories: [], variants: [], sort_by: 'name', sort_direction: 'asc', page: 1, per_page: 60 };

const snapshot = (overrides: Partial<BrowserSnapshot> = {}): BrowserSnapshot => ({
  icons: [icon(1), icon(2), icon(3, { category: 'shapes' })],
  pagination: { total: 300, per_page: 60, current_page: 1, last_page: 5, from: 1, to: 60 },
  appliedFilters: echo,
  tree: [{ id: 'ichava/icon-sets-tabler', title: 'Tabler', icon_count: 2, children: [{ name: 'arrows', icon_count: 2 }] }],
  packages: [{ name: 'ichava/icon-sets-tabler', label: 'Tabler', count: 300 }],
  filterOptions: {
    packages: [{ name: 'ichava/icon-sets-tabler', label: 'Tabler', count: 300 }],
    categories: [{ id: 4, name: 'arrows', label: 'Arrows', count: 120 }],
    variants: [{ id: 9, slug: 'outline', label: 'Outline', icon_count: 280 }],
  },
  ...overrides,
});

const defaults = { search: '', packages: [], categories: [], subs: [], variants: [], page: 1, perPage: 60, sortBy: 'name' as const, sortDirection: 'asc' as const };

describe('InertiaCatalog.listIcons', () => {
  it('answers the page the props already hold without a visit', async () => {
    const visit = vi.fn<VisitFn>();
    const catalog = new InertiaCatalog(snapshot(), { url: '/ichava/icons', visit });

    const page = await catalog.listIcons(defaults);

    expect(visit).not.toHaveBeenCalled();
    expect(page.items.map((i) => i.id)).toEqual([1, 2, 3]);
    // Server totals, not the length of the loaded page.
    expect(page).toMatchObject({ total: 300, page: 1, perPage: 60, lastPage: 5, rangeStart: 1, rangeEnd: 60 });
  });

  it('visits the Inertia route for any other page, with the server-valid query', async () => {
    const next = snapshot({
      icons: [icon(61)],
      pagination: { total: 300, per_page: 60, current_page: 2, last_page: 5, from: 61, to: 120 },
      appliedFilters: { ...echo, page: 2 },
    });
    const visit = vi.fn<VisitFn>(async () => next);
    const catalog = new InertiaCatalog(snapshot(), { url: '/ichava/icons', visit });

    const page = await catalog.listIcons({ ...defaults, page: 2, search: 'a' });

    expect(visit).toHaveBeenCalledTimes(1);
    expect(visit.mock.calls[0][0]).toBe('/ichava/icons');
    // A one-letter search is dropped, as IconFilterRequest (min:2) would reject it.
    expect(visit.mock.calls[0][1]).toMatchObject({ page: 2, search: undefined, per_page: 60 });
    expect(page.items.map((i) => i.id)).toEqual([61]);
    expect(page.page).toBe(2);

    // The new props are now the snapshot: asking again costs nothing.
    await catalog.listIcons({ ...defaults, page: 2 });
    expect(visit).toHaveBeenCalledTimes(1);
  });

  it('rejects when the visit is aborted, so the browser drops the stale page', async () => {
    const controller = new AbortController();
    const visit = vi.fn<VisitFn>(async () => {
      controller.abort();
      return snapshot({ appliedFilters: { ...echo, page: 4 } });
    });
    const catalog = new InertiaCatalog(snapshot(), { url: '/ichava/icons', visit });

    await expect(catalog.listIcons({ ...defaults, page: 4 }, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('visits when the props carry no echo (the controller error path sends [])', async () => {
    const visit = vi.fn<VisitFn>(async () => snapshot());
    const catalog = new InertiaCatalog(snapshot({ appliedFilters: [] }), { url: '/ichava/icons', visit });

    await catalog.listIcons(defaults);
    expect(visit).toHaveBeenCalledTimes(1);
  });
});

describe('InertiaCatalog, the rest of the port', () => {
  const catalog = new InertiaCatalog(snapshot(), { url: '/ichava/icons', visit: vi.fn<VisitFn>() });

  it('finds any icon it has seen, and none it has not', async () => {
    expect((await catalog.getIcon(2))?.name).toBe('icon-2');
    expect(await catalog.getIcon(999)).toBeNull();
  });

  it('serves inline SVG without a request', async () => {
    const i = await catalog.getIcon(1);
    expect(await catalog.getSvg(i!)).toContain('<svg');
  });

  it('normalises the server tree and filter options', async () => {
    expect(await catalog.getTree()).toEqual([{ pack: 'ichava/icon-sets-tabler', label: 'Tabler', count: 2, cats: [{ name: 'arrows', count: 2 }] }]);
    const filters = await catalog.getFilters();
    expect(filters.packages.map((p) => p.id)).toEqual(['ichava/icon-sets-tabler']);
    expect(filters.categories[0]).toMatchObject({ name: 'arrows', label: 'Arrows', count: 120 });
    expect(filters.variants[0]).toMatchObject({ name: 'outline', count: 280 });
    expect(await catalog.getVariantCounts()).toEqual(new Map([['outline', 280]]));
  });

  it('relates icons by category among those loaded', async () => {
    const one = await catalog.getIcon(1);
    expect((await catalog.getRelated(one!)).map((i) => i.id)).toEqual([2]);
  });
});

describe('InertiaCatalog catalog metadata', () => {
  it('lists the packs with the host default and each pack’s variant descriptions', async () => {
    const catalog = new InertiaCatalog(
      snapshot({
        packages: [
          { name: 'ichava/icon-sets-tabler', label: 'Tabler', count: 300, kind: 'icon', default: true },
          { name: 'ichava/icon-sets-flag', label: 'Flags', count: 40 },
        ],
        filterOptions: {
          variants_by_package: {
            'ichava/icon-sets-tabler': [
              { slug: 'outline', label: 'Outline', description: 'Stroked shapes', default: true },
              { slug: 'filled', label: '', description: 'Solid shapes', default: false },
              { label: 'no slug' },
            ],
          },
        },
      }),
      { url: '/ichava/icons', visit: vi.fn<VisitFn>() },
    );

    const meta = await catalog.getCatalogMeta();

    expect(meta.packages.map((p) => [p.id, p.default ?? false])).toEqual([
      ['ichava/icon-sets-tabler', true],
      ['ichava/icon-sets-flag', false],
    ]);
    expect(meta.packages[0]).toMatchObject({ label: 'Tabler', count: 300, kind: 'icon' });
    expect(meta.variantsByPackage).toEqual({
      'ichava/icon-sets-tabler': [
        { slug: 'outline', label: 'Outline', description: 'Stroked shapes', default: true },
        { slug: 'filled', label: 'filled', description: 'Solid shapes', default: false },
      ],
    });
  });

  it('reads an empty variant map sent as [] as none', async () => {
    const catalog = new InertiaCatalog(snapshot({ filterOptions: { variants_by_package: [] } }), { url: '/ichava/icons', visit: vi.fn<VisitFn>() });
    expect((await catalog.getCatalogMeta()).variantsByPackage).toEqual({});
  });
});

describe('InertiaCatalog.getTreeFor', () => {
  const treeOf = (cat: string) => [{ id: 'ichava/icon-sets-tabler', title: 'Tabler', icon_count: 1, children: [{ name: cat, icon_count: 1 }] }];

  it('answers from the tree prop while only the categories, page or sort differ', async () => {
    const visit = vi.fn<VisitFn>();
    const catalog = new InertiaCatalog(snapshot(), { url: '/ichava/icons', visit });

    const tree = await catalog.getTreeFor({ ...defaults, categories: ['arrows'], page: 3, sortDirection: 'desc' });

    expect(visit).not.toHaveBeenCalled();
    expect(tree[0]?.cats.map((c) => c.name)).toEqual(['arrows']);
  });

  it('shares one visit with the grid for a new selection, and returns its tree', async () => {
    let resolve!: (p: Partial<BrowserSnapshot>) => void;
    const visit = vi.fn<VisitFn>(() => new Promise((r) => (resolve = r)));
    const catalog = new InertiaCatalog(snapshot(), { url: '/ichava/icons', visit });

    const params = { ...defaults, search: 'arrow' };
    const tree = catalog.getTreeFor(params);
    const page = catalog.listIcons(params);
    resolve(snapshot({ appliedFilters: { ...echo, search: 'arrow' }, tree: treeOf('curved') }));

    expect((await tree)[0]?.cats.map((c) => c.name)).toEqual(['curved']);
    expect((await page).items).toHaveLength(3);
    expect(visit).toHaveBeenCalledTimes(1);
  });

  it('reloads the tree with every listing visit', async () => {
    const { LISTING_PROPS } = await import('./InertiaCatalog');
    expect(LISTING_PROPS).toContain('tree');
  });
});
