import { render } from '@testing-library/react';
import axe from 'axe-core';
import type { ComponentType } from 'react';
import { describe, expect, it, vi } from 'vitest';

/**
 * Accessibility of every Inertia page this package renders around the browser (I4, run under
 * manual CI while private-repo Actions are off). axe runs over each page in jsdom, empty and
 * with data, so a missing label, an unnamed control or a broken heading order fails here
 * rather than in production. Colour contrast needs real layout and is left to the browser
 * end-to-end run (e2e/a11y.spec.ts), which is why `color-contrast` is off below.
 */

const shared = {
  auth: null,
  flash: {},
  errors: {},
  preferences: {},
  ichava: {
    prefix: 'ichava',
    perPage: 24,
    defaultTheme: 'light',
    ui: { version: '0.1.0', license: 'Proprietary', docsUrl: null, links: [] },
    routes: {
      browser: '/ichava/icons',
      stats: '/ichava/stats',
      packages: '/ichava/packages',
      favorites: '/ichava/favorites',
      collections: '/ichava/collections',
      history: '/ichava/history',
      commands: '/ichava/commands',
      settings: '/ichava/settings',
      cache: { clear: '/ichava/cache/clear', rebuild: '/ichava/cache/rebuild' },
    },
  },
};

let pageProps: Record<string, unknown> = {};

vi.mock('@inertiajs/react', () => ({
  usePage: () => ({ props: pageProps, url: '/ichava', component: 'Test' }),
  Link: ({ href, children, ...rest }: { href: string; children?: unknown }) => (
    <a href={href} {...(rest as Record<string, unknown>)}>
      {children as never}
    </a>
  ),
  Head: () => null,
  router: { visit: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), reload: vi.fn(), on: () => () => {} },
  useForm: (initial: Record<string, unknown>) => ({
    data: initial,
    setData: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    processing: false,
    errors: {},
    recentlySuccessful: false,
  }),
}));

const icon = {
  id: 7,
  package: 'ichava/icon-sets-tabler',
  name: 'home',
  category: 'outline',
  variant: 'outline',
  icon_path: 'ichava/icon-sets-tabler::outline/home',
  svg_content: '<svg viewBox="0 0 24 24"><path d="M3 12h18"/></svg>',
  svg_url: '/ichava/api/icons/7/svg',
};

const pages: [string, () => Promise<{ default: ComponentType }>, Record<string, unknown>[]][] = [
  ['Collections/Index', () => import('../Collections/Index'), [{ collections: [] }, { collections: [{ id: 'c1', name: 'Nav', icons: [{ id: 7, name: 'home' }] }] }]],
  ['Collections/Show', () => import('../Collections/Show'), [{ collection: null }, { collection: { id: 'c1', name: 'Nav', icons: [icon] } }]],
  ['CommandHistory/Index', () => import('../CommandHistory/Index'), [{ commands: [], count: 0 }, { commands: [{ command: 'ichava::ichava-core.cache', type: 'cache', formatted_time: 'just now' }], count: 1 }]],
  ['Favorites/Index', () => import('../Favorites/Index'), [{ ids: [], icons: [], count: 0 }, { ids: [7], icons: [icon], count: 1 }]],
  ['History/Index', () => import('../History/Index'), [{ history: [], count: 0 }, { history: [{ icon_id: 7, action: 'viewed', formatted_time: 'just now', icon }], count: 1 }]],
  ['Packages/Index', () => import('../Packages/Index'), [{ packages: [] }, { packages: [{ name: 'ichava/icon-sets-tabler', label: 'Tabler', count: 6202, vendor: 'ichava' }] }]],
  ['Packages/Show', () => import('../Packages/Show'), [{ package: null }]],
  ['Settings/Index', () => import('../Settings/Index'), [{ preferences: { preferences: { view_mode: 'grid', icon_size: 24, per_page: 24 }, sorting: { sort_by: 'name', sort_direction: 'asc' } } }]],
  ['Stats/Index', () => import('../Stats/Index'), [{ statistics: null, packageStats: [], topCategories: [], cacheStats: {}, cacheHealthy: true, updateStatus: null }]],
  ['Browser/Show', () => import('../Browser/Show'), [{ icon: null, related: [] }, { icon, related: [] }]],
];

describe('every page passes axe', () => {
  it('covers all ten non-browser pages', () => {
    // A guard that iterates nothing passes; pin how many pages it inspects.
    expect(pages).toHaveLength(10);
  });

  for (const [name, load, variants] of pages) {
    variants.forEach((props, i) => {
      it(`${name} (${i === 0 ? 'empty' : 'with data'})`, async () => {
        pageProps = { ...shared, ...props };
        const { default: Page } = await load();
        const { container } = render(<Page />);
        const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
        const found = result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(found, `${name}: ${found.join(' | ')}`).toEqual([]);
      });
    });
  }
});
