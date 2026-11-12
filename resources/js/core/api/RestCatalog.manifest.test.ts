import { afterEach, describe, expect, it, vi } from 'vitest';
import { RestCatalog } from './ApiClient';
import { MAP } from '@/test/hostFixtures';

/**
 * A REST catalog for a host that sent its bootstrap REST map reads every URL from that
 * map (payload schema 1.2.0, `api.endpoints`); none is built from a base and a segment.
 * The map's URLs here share no prefix, so a derived URL cannot pass.
 */

/** `fetch` answering by URL (query string ignored), recording each URL asked for. */
function routes(answers: Record<string, unknown>) {
  const asked: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown) => {
      const u = String(url);
      asked.push(u);
      const body = answers[u.split('?')[0]!] ?? {};
      const text = typeof body === 'string' ? body : JSON.stringify(body);
      return new Response(text, { status: 200, headers: { 'content-type': typeof body === 'string' ? 'image/svg+xml' : 'application/json' } });
    }),
  );
  return asked;
}

const FILTERS = {
  packages: [
    { name: 'ichava/icon-sets-tabler', label: 'Tabler', count: 6202, description: 'Outline and filled UI icons', vendor: 'tabler', kind: 'icon', default: true },
    { name: 'ichava/icon-sets-flag', label: 'Flags', count: 542, description: '', vendor: 'lipis', kind: 'icon', default: false },
  ],
  categories: [],
  variants: [{ name: 'outline', label: 'Outline', count: 3 }],
  variants_by_package: {
    'ichava/icon-sets-tabler': [
      { slug: 'outline', label: 'Outline', description: 'Two-pixel strokes, no fill', attributes: {}, previewIcon: null, colorScheme: null, displayOrder: 1, default: true },
      { slug: 'filled', label: 'Filled', description: 'Solid shapes', attributes: {}, previewIcon: null, colorScheme: null, displayOrder: 2, default: false },
    ],
  },
  kinds: [{ name: 'icon', count: 6744 }],
  empty: false,
};

afterEach(() => vi.unstubAllGlobals());

describe('RestCatalog, given the host REST map', () => {
  it('sends every catalog request to the URL the map names', async () => {
    const asked = routes({
      [MAP['icons.list']]: { data: [{ id: 1, package: 'p', name: 'home', category: 'c', variant: 'outline' }], meta: { total: 1 } },
      [MAP['icons.show'].replace('{iconId}', '9')]: { success: true, data: { id: 9, package: 'p', name: 'bell', category: 'c', variant: 'outline' } },
      [MAP['icons.svg'].replace('{iconId}', '9')]: '<svg/>',
      [MAP['icons.filters']]: FILTERS,
      [MAP['icons.tree']]: { success: true, data: [] },
      [MAP['icons.statistics']]: { success: true, data: { total: 1 } },
    });
    const cat = new RestCatalog('/nowhere').withEndpoints(MAP);
    expect((await cat.listIcons({ search: 'home' })).items[0]!.name).toBe('home');
    const bell = await cat.getIcon(9);
    expect(bell?.name).toBe('bell');
    expect(await cat.getSvg(bell!)).toBe('<svg/>');
    await cat.getFilters();
    await cat.getTree();
    expect(await cat.getStatistics()).toEqual({ total: 1 });
    expect(asked).toEqual([
      'https://app.test/v1-icons/listing?search=home',
      'https://app.test/v1-icons/one/9',
      'https://app.test/v1-svg/9.svg',
      'https://app.test/v1-icons/facets',
      'https://app.test/v1-icons/folders',
      'https://app.test/v1-icons/stats',
    ]);
    expect(asked.some((u) => u.includes('/nowhere'))).toBe(false);
  });

  it('keeps the map through the fluent setters, and falls back to the base for a key it lacks', async () => {
    const asked = routes({});
    const cat = RestCatalog.fromApi({ base: 'https://app.test/v1-root', endpoints: { 'icons.list': MAP['icons.list'] } }).timeout(5_000);
    expect(cat.endpoints).toEqual({ 'icons.list': MAP['icons.list'] });
    await cat.listIcons({});
    await cat.getStatistics();
    expect(asked).toEqual([MAP['icons.list'], 'https://app.test/v1-root/icons/statistics']);
  });

  it('uses the transport default only when the map has no base', () => {
    expect(RestCatalog.fromApi({ base: null, endpoints: [] }).transport.config.baseUrl).toBe('/ichava/api/v1');
    expect(RestCatalog.fromApi({ base: null, endpoints: [] }).endpoints).toEqual({});
    expect(new RestCatalog().endpoints).toBeNull();
  });

  it("reads icon-browser's pack rows, with the default pack, and each pack's variant descriptions", async () => {
    routes({ [MAP['icons.filters']]: FILTERS });
    const cat = new RestCatalog().withEndpoints(MAP);
    const meta = await cat.getCatalogMeta();
    expect(meta.packages).toEqual([
      { id: 'ichava/icon-sets-tabler', label: 'Tabler', description: 'Outline and filled UI icons', count: 6202, installed: true, loaded: true, kind: 'icon', default: true },
      { id: 'ichava/icon-sets-flag', label: 'Flags', count: 542, installed: true, loaded: true, kind: 'icon' },
    ]);
    expect(meta.variantsByPackage['ichava/icon-sets-tabler']).toEqual([
      { slug: 'outline', label: 'Outline', description: 'Two-pixel strokes, no fill', default: true },
      { slug: 'filled', label: 'Filled', description: 'Solid shapes', default: false },
    ]);
    // getFilters lists the same packs in the catalog's own shape (`id`, not `name`).
    expect((await cat.getFilters()).packages.map((p) => p.id)).toEqual(['ichava/icon-sets-tabler', 'ichava/icon-sets-flag']);
  });

  it('counts the tree over the selection, but not over the category selection, paging or sort', async () => {
    const asked = routes({ [MAP['icons.tree']]: { success: true, data: [] } });
    const cat = new RestCatalog().withEndpoints(MAP);
    await cat.getTreeFor({ search: 'arrow', packages: ['ichava/icon-sets-tabler'], categories: ['ui'], subs: ['ui/x'], variants: ['outline'], kind: 'icon', page: 3, perPage: 60, sortBy: 'name', sortDirection: 'asc' });
    const url = new URL(asked[0]!);
    expect(url.origin + url.pathname).toBe(MAP['icons.tree']);
    expect([...url.searchParams.keys()].sort()).toEqual(['kind', 'packages[]', 'search', 'variants[]']);
  });
});
