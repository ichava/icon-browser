import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { IchavaBrowser } from '@/lib/browser';
import { createBrowserMount, hydrateLibrary, isHydrating, type BrowserPageProps } from './browserMount';
import type { VisitFn } from './InertiaCatalog';

/**
 * The port's end-to-end proof inside this package: the Inertia props of `Browser/Index`
 * mount react-icon-browser's `IchavaBrowser` through the builder, the first page renders
 * from the props without a visit, and the store starts on the server's filters and library.
 */
const page = (overrides: Partial<BrowserPageProps> = {}): BrowserPageProps => ({
  icons: [
    { id: 11, package: 'ichava/icon-sets-tabler', name: 'home', category: 'navigation', variant: 'outline', svg_content: '<svg viewBox="0 0 24 24"/>' },
    { id: 12, package: 'ichava/icon-sets-tabler', name: 'menu', category: 'navigation', variant: 'outline', svg_content: '<svg viewBox="0 0 24 24"/>' },
  ],
  pagination: { total: 2, per_page: 24, current_page: 1, last_page: 1, from: 1, to: 2 },
  appliedFilters: { search: 'ho', packages: ['ichava/icon-sets-tabler'], categories: [], variants: [], sort_by: 'name', sort_direction: 'asc', page: 1, per_page: 24 },
  tree: [],
  packages: [{ name: 'ichava/icon-sets-tabler', label: 'Tabler', count: 2 }],
  favorites: [12],
  collections: [{ id: '7', name: 'Nav', icon_ids: [11] }],
  history: [{ icon_id: 11, action: 'copy', timestamp: '2026-10-01T00:00:00Z' }],
  ichava: { ui: { version: '0.1.0', license: 'Proprietary', docsUrl: 'https://example.test/docs', links: [] } },
  ...overrides,
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('createBrowserMount', () => {
  it('starts the store on the server filters and library, before any render', () => {
    const { store, props } = createBrowserMount(page(), { url: '/ichava/icons', visit: vi.fn<VisitFn>() });
    const s = store.getState();

    expect(s.filters).toMatchObject({ search: 'ho', packages: ['ichava/icon-sets-tabler'], page: 1, perPage: 24 });
    expect(s.favorites).toEqual([12]);
    expect(s.collections).toEqual([{ id: '7', name: 'Nav', icons: [11] }]);
    // The server's verbs come back as the browser's, so a new 'copied' dedupes with this one.
    expect(s.history).toEqual([{ id: 11, action: 'copied', ts: Date.parse('2026-10-01T00:00:00Z') }]);

    expect(props.store).toBe(store);
    expect(props.client).toBeDefined();
    expect(props.catalog).toBeUndefined();
    expect(props.manageDocument).toBe(true);
    expect(props.syncUrl).toBeUndefined();
  });

  it("passes this package's licence and version, not the library's defaults", () => {
    const { props } = createBrowserMount(page(), { url: '/ichava/icons', visit: vi.fn<VisitFn>() });

    expect(props.config?.meta.license).toBe('Proprietary');
    expect(props.config?.meta.version).toBe('0.1.0');
    expect(props.config?.about.links).toEqual([{ label: 'Docs', href: 'https://example.test/docs' }]);
  });

  it('renders the first page from the props, with no visit', async () => {
    const visit = vi.fn<VisitFn>();
    const mount = createBrowserMount(page(), { url: '/ichava/icons', visit });

    render(<IchavaBrowser {...mount.props} />);

    await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText('menu')).toBeInTheDocument();
    expect(visit).not.toHaveBeenCalled();
    // A first visit: the config's defaults block must not have replaced the server's filters.
    expect(mount.store.getState().filters).toMatchObject({ search: 'ho', perPage: 24 });
  });
});

describe('hydrateLibrary', () => {
  it('marks the store as hydrating only while it writes', () => {
    const { store } = createBrowserMount(page(), { url: '/ichava/icons', visit: vi.fn<VisitFn>() });
    const seen: boolean[] = [];
    const unsubscribe = store.subscribe(() => seen.push(isHydrating(store)));

    hydrateLibrary(store, { favorites: [11, 12] });
    store.getState().toggleFavorite(11);
    unsubscribe();

    expect(seen).toEqual([true, false]);
    expect(isHydrating(store)).toBe(false);
  });
});
