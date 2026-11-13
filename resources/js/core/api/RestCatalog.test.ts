import { afterEach, describe, expect, it, vi } from 'vitest';
import { RestCatalog } from './ApiClient';

function mockFetch(body: unknown, contentType = 'application/json') {
  return vi.fn(async () =>
    new Response(typeof body === 'string' ? body : JSON.stringify(body), { status: 200, headers: { 'content-type': contentType } }),
  );
}

afterEach(() => vi.restoreAllMocks());

describe('RestCatalog (envelope normalization)', () => {
  it('normalizes a ResourceCollection with array-valued meta + grouped sibling', async () => {
    // ADPT-A quirks: bare `data` array, `grouped` sibling, meta values as arrays.
    vi.stubGlobal(
      'fetch',
      mockFetch({
        data: [
          { id: 1, package: 'ichava/icon-sets-tabler', name: 'home', category: 'general', variant: 'outline' },
          { id: 2, package: 'ichava/icon-sets-tabler', name: 'user', category: 'general', variant: 'outline' },
        ],
        grouped: { general: [1, 2] },
        meta: { total: [2], per_page: ['60'], current_page: [1], last_page: [1] },
      }),
    );
    const cat = new RestCatalog();
    const page = await cat.listIcons({ perPage: 60, page: 1 });
    expect(page.total).toBe(2);
    expect(page.perPage).toBe(60);
    expect(page.items.map((i) => i.name)).toEqual(['home', 'user']);
    expect(page.items[0]!.id).toBe(1);
  });

  it('reads the BARE filters response (no success wrapper)', async () => {
    vi.stubGlobal('fetch', mockFetch({ packages: [{ id: 'ichava/icon-sets-tabler', label: 'tabler-icons', count: 5, installed: true, loaded: true }], categories: [], variants: [] }));
    const f = await new RestCatalog().getFilters();
    expect(f.packages).toHaveLength(1);
    expect(f.categories).toEqual([]);
  });

  it('unwraps a single icon from the success envelope', async () => {
    vi.stubGlobal('fetch', mockFetch({ success: true, data: { id: 9, package: 'ichava/icon-sets-tabler', name: 'bell', category: 'communication', variant: 'outline' } }));
    const icon = await new RestCatalog().getIcon(9);
    expect(icon?.name).toBe('bell');
  });
});
