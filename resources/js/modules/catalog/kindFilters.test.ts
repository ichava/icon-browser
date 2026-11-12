import { describe, expect, it } from 'vitest';
import { CatalogIndex, IconQuery } from '@/modules/catalog';
import { emptyReasonFor, RestCatalog, StaticCatalog, type ListedPage } from '@/core/api/ApiClient';
import { DEFAULT_FILTERS } from '@/core/defaults';
import { mkIcon } from '@/test/fixtures';

const catalog = {
  meta: { total_ecosystem: 4, generated: '2026-10-30' },
  packages: [],
  icons: [
    mkIcon({ id: 1, name: 'home', tags: ['house', 'building'], keywords: ['start'] }),
    mkIcon({ id: 2, name: 'arrow', tags: ['direction'] }),
    mkIcon({ id: 3, name: 'team-at-work', kind: 'illustration', tags: ['people'] }),
    mkIcon({ id: 4, name: 'empty-inbox', kind: 'illustration' }),
  ],
};

describe('kinds, tags and keywords in static mode', () => {
  const index = new CatalogIndex(catalog);

  it('filters by kind and counts both kinds over the other filters', () => {
    expect(index.page({ kind: 'illustration' }).items.map((i) => i.id)).toEqual([4, 3]);
    expect(index.kindCounts({ kind: 'icon' })).toEqual({ icon: 2, illustration: 2 });
    expect(index.kindCounts({ search: 'home' })).toEqual({ icon: 1, illustration: 0 });
  });

  it('requires every chosen tag and keyword', () => {
    expect(index.page({ tags: ['house'] }).items.map((i) => i.id)).toEqual([1]);
    expect(index.page({ tags: ['house', 'direction'] }).total).toBe(0);
    expect(index.page({ keywords: ['start'] }).items.map((i) => i.id)).toEqual([1]);
  });

  it('carries the filters into list parameters', () => {
    const params = IconQuery.from({ ...DEFAULT_FILTERS, kind: 'illustration', tags: ['people'] }).toListParams();
    expect(params).toMatchObject({ kind: 'illustration', tags: ['people'] });
    expect(params).not.toHaveProperty('keywords');
  });

  it('says why a page is empty', async () => {
    const page = (await new StaticCatalog(catalog).listIcons({ tags: ['nothing'] })) as ListedPage;
    expect(page.emptyReason).toBe('no_match');
    expect(emptyReasonFor({ ...page, total: 0 }, {}, 0)).toBe('no_icons');
    expect(emptyReasonFor({ ...page, total: 3 }, {}, 3)).toBeNull();
  });
});

describe('kinds, tags and keywords over REST', () => {
  it('sends the new filters and reads the empty reason and the kind facet', async () => {
    const urls: string[] = [];
    const catalogRest = new RestCatalog('/ichava/api/v1');
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      urls.push(url);
      const body = url.includes('/icons/filters')
        ? { packages: [], categories: [], variants: [], kinds: [{ name: 'icon', count: 12 }, { name: 'illustration', count: 3 }] }
        : { data: [], meta: { total: 0, per_page: 60, current_page: 1, last_page: 1, empty_reason: 'no_match' } };
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;
    try {
      const page = (await catalogRest.listIcons({ kind: 'illustration', tags: ['people'], keywords: ['team'], language: 'english' })) as ListedPage;
      expect(page.emptyReason).toBe('no_match');
      expect(decodeURIComponent(urls[0]!)).toContain('/ichava/api/v1/icons?kind=illustration&tags[]=people&keywords[]=team&language=english');
      const counts = await catalogRest.getKindCounts({ kind: 'illustration', search: 'x' });
      expect(counts).toEqual({ icon: 12, illustration: 3 });
      expect(decodeURIComponent(urls[1]!)).toBe('/ichava/api/v1/icons/filters?search=x');
    } finally {
      globalThis.fetch = original;
    }
  });
});
