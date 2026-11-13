import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { IchavaBrowser } from './IchavaBrowser';
import { createCatalog } from './core/api/ApiClient';
import { resolveConfig } from './core/config';
import { createBrowserStore } from './store';
import { hostConfig, hostFromBootstrap } from '@/modules/host';
import { bootstrapDoc, MAP } from '@/test/hostFixtures';
import { catalog, mkIcon } from '@/test/fixtures';

/**
 * A REST host on payload schema 1.2.0: the browser reads every URL from the bootstrap
 * document's REST map, lists the host's packs and opens on its default, describes the
 * variants in the pack's own words, and counts the tree over the selection.
 */

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

const FILTERS = {
  packages: [
    { name: 'ichava/icon-sets-tabler', label: 'Tabler', count: 2, description: 'UI icons', kind: 'icon', default: true },
    { name: 'ichava/icon-sets-flag', label: 'Flags', count: 1, description: 'Country flags', kind: 'icon', default: false },
  ],
  categories: [],
  variants: [{ name: 'outline', label: 'Outline', count: 2 }],
  variants_by_package: {
    'ichava/icon-sets-tabler': [{ slug: 'outline', label: 'Outline', description: 'Two-pixel strokes, no fill', default: true }],
  },
  kinds: [{ name: 'icon', count: 3 }],
  empty: false,
};

let fetchMock: ReturnType<typeof vi.fn>;
const asked = () => fetchMock.mock.calls.map((c) => String(c[0]));

beforeEach(() => {
  fetchMock = vi.fn(async (url: unknown) => {
    const u = String(url).split('?')[0]!;
    if (u === MAP['icons.filters']) return json(FILTERS);
    if (u === MAP['icons.tree']) return json({ success: true, data: [] });
    if (u === MAP['icons.list']) {
      return json({
        data: [{ id: 1, name: 'home', package: 'ichava/icon-sets-tabler', category: 'navigation', variant: 'outline', svg_url: `${MAP['icons.svg'].replace('{iconId}', '1')}` }],
        meta: { total: 1, per_page: 60, current_page: 1, last_page: 1 },
      });
    }
    if (u === MAP['library.show']) return json({ success: true, data: { favorites: [], collections: [], history: [], commandHistory: [] } });
    if (u === MAP['preferences.show']) return json({ success: true, data: {} });
    if (u.endsWith('.svg')) return new Response('<svg viewBox="0 0 24 24"/>', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } });
    return json({});
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function mountRestHost() {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential' });
  const config = resolveConfig(hostConfig(hostFromBootstrap(bootstrapDoc())));
  // A client built from the transport default: the host's REST map replaces its URLs.
  const client = createCatalog('rest', { base: '/ichava/api/v1' });
  render(<IchavaBrowser client={client} config={config} store={store} />);
  return store;
}

describe('a REST host with a bootstrap REST map', () => {
  it('reads every URL from the map, never the transport default', async () => {
    mountRestHost();
    await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument(), { timeout: 2000 });
    await waitFor(() => expect(asked()).toContain(MAP['library.show']));
    expect(asked().some((u) => u.startsWith(MAP['icons.list']))).toBe(true);
    expect(asked().some((u) => u.startsWith(MAP['icons.filters']))).toBe(true);
    expect(asked().filter((u) => u.includes('/ichava/api'))).toEqual([]);
  });

  it("lists the host's packs and opens on every installed one (Q42)", async () => {
    const store = mountRestHost();
    const all = ['ichava/icon-sets-tabler', 'ichava/icon-sets-flag'];
    await waitFor(() => expect(store.getState().filters.packages).toEqual(all), { timeout: 2000 });
    const packs = await screen.findByRole('group', { name: /packages/i });
    expect(within(packs).getByRole('checkbox', { name: 'Tabler' })).toBeChecked();
    expect(within(packs).getByRole('checkbox', { name: 'Flags' })).toBeChecked();
    // Chosen once: the user's next choice stands.
    act(() => store.getState().selectAllPacks(['ichava/icon-sets-flag']));
    await new Promise((r) => setTimeout(r, 50));
    expect(store.getState().filters.packages).toEqual(['ichava/icon-sets-flag']);
  });

  it('counts the category tree over the selection', async () => {
    mountRestHost();
    // After the opening packs are chosen, the tree is asked for again, narrowed to them.
    await waitFor(
      () => expect(asked().some((u) => u.startsWith(MAP['icons.tree']) && decodeURIComponent(u).includes('packages[]=ichava/icon-sets-flag'))).toBe(true),
      { timeout: 2000 },
    );
  });

  it("describes a variant in the pack's own words", async () => {
    mountRestHost();
    const band = await screen.findByRole('radiogroup', { name: 'Icon variant' });
    const outline = await within(band).findByRole('radio', { name: /outline/i });
    await waitFor(() => expect(asked().some((u) => u.startsWith(MAP['icons.filters']))).toBe(true));
    // Keyboard focus opens a react-aria tooltip at once.
    fireEvent.keyDown(document.body, { key: 'Tab' });
    act(() => outline.focus());
    expect(await screen.findByRole('tooltip', {}, { timeout: 2000 })).toHaveTextContent('Two-pixel strokes, no fill');
  });
});

describe('the detail dialog', () => {
  it('shows the subcategory an icon sits in', async () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential' });
    const nested = { ...catalog, icons: [...catalog.icons, mkIcon({ id: 901, name: 'nested-one', category: 'arrows', sub: 'curved', svgContent: '<svg viewBox="0 0 24 24"/>' })] };
    render(<IchavaBrowser catalog={nested} config={resolveConfig(null)} store={store} />);
    await screen.findByRole('grid');
    act(() => store.getState().openDetail(901));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.textContent).toContain('arrows › curved');
  });
});
