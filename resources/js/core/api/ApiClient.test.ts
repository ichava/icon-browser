import { afterEach, describe, expect, it, vi } from 'vitest';
import { RestCatalog, StaticCatalog, createCatalog } from './ApiClient';
import type { Catalog } from '@/modules/catalog';
import type { Icon } from '@ichava/js-ui-kernel';

/**
 * The `IconCatalog` port was built (both adapters, envelope normalization
 * included) and then never wired into anything -- `IchavaBrowser` still only
 * accepted a raw `Catalog`. It had no tests, which is how that went unnoticed.
 */

function mockFetch(impl: (url: string) => Response | Promise<Response>) {
  const fn = vi.fn(async (url: unknown) => impl(String(url)));
  vi.stubGlobal('fetch', fn);
  return fn;
}

const mkIcon = (over: Partial<Icon> = {}): Icon => ({
  id: 1,
  name: 'home',
  package: 'tabler',
  category: 'navigation',
  variant: 'outline',
  tags: [],
  keywords: [],
  ...over,
} as Icon);


afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StaticCatalog.getTree / getRelated', () => {
  const catalog: Catalog = {
    meta: { total_ecosystem: 3, generated: '2026-01-01' },
    packages: [{ id: 'tabler', label: 'Tabler', count: 0, installed: true, loaded: true }],
    icons: [
      mkIcon({ id: 1, category: 'navigation' }),
      mkIcon({ id: 2, category: 'navigation' }),
      mkIcon({ id: 3, category: 'weather' }),
    ],
  };

  it('getTree mirrors IconRepository.categoryTree', async () => {
    const tree = await new StaticCatalog(catalog).getTree();
    expect(tree.map((g) => g.pack)).toEqual(['tabler']);
    expect(tree[0]!.cats.map((c) => c.name).sort()).toEqual(['navigation', 'weather']);
  });

  it('getRelated excludes the icon itself and ranks same category before a shared name elsewhere', async () => {
    // All three fixtures are named "home": the same-category one ranks first, the one in
    // another category still relates by its name, and an unrelated icon stays out.
    const withStranger: Catalog = { ...catalog, icons: [...catalog.icons, mkIcon({ id: 4, name: 'cloud', package: 'other', category: 'weather' })] };
    const related = await new StaticCatalog(withStranger).getRelated(mkIcon({ id: 1, category: 'navigation' }));
    expect(related.map((i) => i.id)).toEqual([2, 3]);
  });
});

describe('RestCatalog.getTree', () => {
  it('normalizes the Laravel filesystem-scan shape into CategoryGroup[]', async () => {
    mockFetch(() =>
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'tabler',
              type: 'package',
              name: 'tabler',
              title: 'Tabler Icons',
              icon_count: 6184,
              children: [
                {
                  id: 'tabler::navigation',
                  type: 'folder',
                  name: 'navigation',
                  label: 'Navigation',
                  path: '/Users/someone/Sites/ichava/icon-sets-tabler/resources/assets/svg/files/outline/navigation',
                  icon_count: 42,
                  package: 'tabler',
                  depth: 0,
                  children: [],
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const tree = await new RestCatalog('/ichava/api/v1').getTree();

    expect(tree).toEqual([
      { pack: 'tabler', label: 'Tabler Icons', count: 1, cats: [{ name: 'navigation', count: 42, sub: undefined }] },
    ]);
  });

  it('never forwards the folder filesystem path to the caller', async () => {
    mockFetch(() =>
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'tabler',
              type: 'package',
              name: 'tabler',
              icon_count: 1,
              children: [{ id: 'x', type: 'folder', name: 'x', path: '/etc/secret', icon_count: 1, package: 'tabler', depth: 0 }],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const tree = await new RestCatalog('/ichava/api/v1').getTree();
    expect(JSON.stringify(tree)).not.toContain('/etc/secret');
  });
});

describe('RestCatalog.getRelated', () => {
  it('fetches one extra icon and drops the current one, over category scope', async () => {
    let capturedUrl = '';
    mockFetch((url) => {
      capturedUrl = url;
      return new Response(
        JSON.stringify({
          data: [
            { id: 1, name: 'home', package: 'tabler', category: 'navigation', variant: 'outline' },
            { id: 2, name: 'menu', package: 'tabler', category: 'navigation', variant: 'outline' },
          ],
          meta: { total: 2, per_page: 3, current_page: 1, last_page: 1 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const related = await new RestCatalog('/ichava/api/v1').getRelated(mkIcon({ id: 1, category: 'navigation' }), 2);

    expect(related.map((i) => i.id)).toEqual([2]);
    expect(capturedUrl).toContain('categories%5B%5D=navigation');
    expect(capturedUrl).toContain('per_page=3'); // limit + 1
  });
});

describe('createCatalog', () => {
  it('builds a StaticCatalog for "static" and requires a catalog', () => {
    expect(() => createCatalog('static', {})).toThrow();
    const c = createCatalog('static', { catalog: { meta: { total_ecosystem: 0, generated: '' }, packages: [], icons: [] } });
    expect(c).toBeInstanceOf(StaticCatalog);
  });

  it('builds a RestCatalog for "rest"', () => {
    expect(createCatalog('rest', { base: '/ichava/api/v1' })).toBeInstanceOf(RestCatalog);
  });
});

describe('getVariantCounts', () => {
  it('static: scoped to the current package/search selection, like IconRepository', async () => {
    const catalog: Catalog = {
      meta: { total_ecosystem: 2, generated: '' },
      packages: [{ id: 'tabler', label: 'Tabler', count: 0, installed: true, loaded: true }],
      icons: [mkIcon({ id: 1, variant: 'outline' }), mkIcon({ id: 2, variant: 'filled' })],
    };
    const counts = await new StaticCatalog(catalog).getVariantCounts({ search: '', packages: [], categories: [], variants: [], page: 1, perPage: 60, sortBy: 'name', sortDirection: 'asc' });
    expect(counts.get('outline')).toBe(1);
    expect(counts.get('filled')).toBe(1);
  });

  it('rest: falls back to the corpus-wide counts from getFilters', async () => {
    mockFetch(() =>
      new Response(
        JSON.stringify({ packages: [], categories: [], variants: [{ id: 'outline', name: 'outline', label: 'Outline', count: 6184 }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const counts = await new RestCatalog('/ichava/api/v1').getVariantCounts({ search: '', packages: [], categories: [], variants: [], page: 1, perPage: 60, sortBy: 'name', sortDirection: 'asc' });
    expect(counts.get('outline')).toBe(6184);
  });
});

describe('RestCatalog theme variants (schema 1.4.0)', () => {
  it('keeps each icon’s theme twins from the list and the single-icon routes', async () => {
    const { themeVariantsOf } = await import('../themeVariants');
    const icon = { id: 7, package: 'acme/scenes', name: 'office', category: 'illustrations', variant: 'default', kind: 'illustration', svg_url: '/s/7', theme_variants: { dark: { svg_url: '/s/7?theme=dark' } } };
    mockFetch((url) =>
      new Response(JSON.stringify(url.includes('/icons/7') ? { data: icon } : { data: [icon, { ...icon, id: 8, theme_variants: [] }], meta: { total: 2, per_page: 60, current_page: 1, last_page: 1 } }), {
        headers: { 'content-type': 'application/json' },
      }),
    );
    const api = new RestCatalog('/ichava/api/v1');
    const page = await api.listIcons({ search: '', packages: [], categories: [], variants: [], page: 1, perPage: 60, sortBy: 'name', sortDirection: 'asc' });
    expect(themeVariantsOf(page.items[0]!)).toEqual({ dark: { svgUrl: '/s/7?theme=dark', svgContent: null } });
    expect(themeVariantsOf(page.items[1]!)).toBeUndefined();
    expect(themeVariantsOf((await api.getIcon(7))!)?.dark?.svgUrl).toBe('/s/7?theme=dark');
  });
});
