import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * Structural accessibility of the three surfaces axe flagged on the built app
 * (FINDINGS B4, B5): the icon grid, the detail dialog and the command palette.
 *
 * jsdom has no layout, so this runs only the rules that read the DOM and the ARIA
 * tree -- required parents and children, allowed attributes, nested interactive
 * controls. Colour contrast needs a real renderer and is gated in e2e/a11y.spec.ts.
 */

const STRUCTURAL_RULES = [
  'aria-required-children',
  'aria-required-parent',
  'aria-allowed-attr',
  'aria-allowed-role',
  'aria-valid-attr-value',
  'aria-prohibited-attr',
  'nested-interactive',
  'list',
  'listitem',
  'button-name',
  'aria-command-name',
  'aria-input-field-name',
];

async function structuralViolations(root: Element): Promise<string[]> {
  const result = await axe.run(root, {
    runOnly: { type: 'rule', values: STRUCTURAL_RULES },
    resultTypes: ['violations'],
  });
  return result.violations.map((v) => `${v.id} x${v.nodes.length}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor"/></svg>';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(SVG, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mount() {
  const store = createBrowserStore({ persistKey: null });
  store.setState({
    tourSeen: true,
    consent: 'essential',
    filters: { ...store.getState().filters, packages: catalog.packages.map((p) => p.id) },
  });
  const utils = render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
  return { store, ...utils };
}

describe('icon grid semantics (B4)', () => {
  it('nests every tile in a row of a grid', async () => {
    mount();
    const grid = await screen.findByRole('grid');
    const rows = within(grid).getAllByRole('row');
    expect(rows.length).toBeGreaterThan(0);
    const cells = within(grid).getAllByRole('gridcell');
    // Every icon on the page, as the grid's own label counts them.
    expect(cells.length).toBeGreaterThan(1);
    expect(cells).toHaveLength(Number.parseInt(grid.getAttribute('aria-label') ?? '', 10));
    for (const cell of cells) expect(cell.closest('[role="row"]')).not.toBeNull();
  });

  it('has no structural axe violations in the main view', async () => {
    const { container } = mount();
    await screen.findByRole('grid');
    expect(await structuralViolations(container)).toEqual([]);
  });

  it('moves focus between tiles with the arrow keys and keeps one tab stop', async () => {
    mount();
    const grid = await screen.findByRole('grid');
    const cells = within(grid).getAllByRole('gridcell');
    expect(cells.filter((c) => c.tabIndex === 0)).toHaveLength(1);
    act(() => cells[0]!.focus());
    fireEvent.keyDown(cells[0]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cells[1]);
    fireEvent.keyDown(cells[1]!, { key: 'End' });
    expect(document.activeElement).toBe(cells[cells.length - 1]);
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(document.activeElement).toBe(cells[0]);
  });
});

describe('sidebar stats are honest (B9)', () => {
  it('counts the icons this catalog holds, not the ecosystem size of the selected packs', async () => {
    // A sampled fixture: the pack reports its full size, the catalog carries a handful.
    const sampled = { ...catalog, packages: catalog.packages.map((p) => ({ ...p, count: p.count * 1000 })) };
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential', filters: { ...store.getState().filters, packages: sampled.packages.map((p) => p.id) } });
    render(<IchavaBrowser catalog={sampled} config={resolveConfig(null)} store={store} />);
    await screen.findByRole('grid');
    const selected = store.getState().filters.packages;
    const held = sampled.icons.filter((i) => selected.includes(i.package)).length;
    expect(held).toBeGreaterThan(0);
    const row = screen.getByText('In this catalog').parentElement!;
    expect(row.lastElementChild).toHaveTextContent(new RegExp(`^${held}$`));
    expect(screen.getByText('Ecosystem total').parentElement!).toHaveTextContent('1,000');
  });
});

describe('console hygiene (B10)', () => {
  it('mounts without "<Focusable> child must be focusable" warnings', async () => {
    const warn = vi.spyOn(console, 'warn');
    mount();
    await screen.findByRole('grid');
    const focusable = warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('<Focusable>'));
    warn.mockRestore();
    expect(focusable).toEqual([]);
  });
});

describe('detail dialog semantics (B4)', () => {
  it('puts the snippet tabs in a tablist and makes the code view focusable', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openDetail(1));
    const dialog = await screen.findByRole('dialog');
    const tablist = within(dialog).getByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(1);
    expect(tabs.filter((t) => t.getAttribute('aria-selected') === 'true')).toHaveLength(1);

    const panel = within(dialog).getByRole('tabpanel');
    const code = within(panel).getByRole('region');
    expect(code).toHaveAttribute('tabindex', '0');
    expect(code).toHaveAccessibleName();

    expect(await structuralViolations(dialog)).toEqual([]);
  });

  it('switches tabs with the arrow keys', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openDetail(1));
    const dialog = await screen.findByRole('dialog');
    const tabs = within(within(dialog).getByRole('tablist')).getAllByRole('tab');
    act(() => tabs[0]!.focus());
    fireEvent.keyDown(tabs[0]!, { key: 'ArrowRight' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[1]);
  });
});

describe('sidebar controls (inventory #3, #5, #6)', () => {
  it('packages are a named checkbox group that toggles with Space', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    const group = screen.getByRole('group', { name: 'Packages' });
    const boxes = within(group).getAllByRole('checkbox');
    expect(boxes.length).toBeGreaterThan(0);
    const first = boxes.find((b) => !(b as HTMLInputElement).disabled)!;
    const before = store.getState().filters.packages.length;
    act(() => first.focus());
    fireEvent.click(first);
    expect(store.getState().filters.packages.length).toBe(before - 1);
  });

  it('the variant band is a radiogroup with arrow keys', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    // By name: the search-scope row above it is a radiogroup too.
    const group = screen.getByRole('radiogroup', { name: 'Icon variant' });
    const radios = within(group).getAllByRole('radio');
    expect(radios.filter((r) => r.getAttribute('aria-checked') === 'true')).toHaveLength(1);
    act(() => radios[0]!.focus());
    fireEvent.keyDown(radios[0]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(radios[1]);
    fireEvent.click(radios[1]!);
    expect(store.getState().filters.variant).toBe('outline');
  });

  it('the search scope is a radiogroup that routes the filter', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    const group = screen.getByRole('radiogroup', { name: 'Search scope' });
    const radios = within(group).getAllByRole('radio');
    expect(radios.map((r) => r.textContent)).toEqual(['Icons', 'Packages', 'Categories', 'All']);
    fireEvent.click(radios[2]!);
    expect(store.getState().searchScope).toBe('categories');
  });

  it('the category tree is a react-aria treegrid with structural roles intact', async () => {
    mount();
    await screen.findByRole('grid');
    const tree = screen.getByRole('treegrid', { name: 'Categories' });
    expect(within(tree).getAllByRole('row').length).toBeGreaterThan(0);
    expect(await structuralViolations(tree)).toEqual([]);
  });
});

describe('tabs (inventory #15, #36)', () => {
  it('mirrors the snippet tabs\' arrow keys in Arabic', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    act(() => store.getState().setLocale('ar'));
    act(() => store.getState().openDetail(1));
    const dialog = await screen.findByRole('dialog');
    const tabs = within(within(dialog).getByRole('tablist')).getAllByRole('tab');
    act(() => tabs[0]!.focus());
    fireEvent.keyDown(tabs[0]!, { key: 'ArrowLeft' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    // setLocale also writes the shared locale; put it back for the tests after this one.
    act(() => store.getState().setLocale('en'));
  });

  it('gives the library a tablist whose tabs own their panels', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openLibrary('favorites'));
    const dialog = await screen.findByRole('dialog');
    const tabs = within(within(dialog).getByRole('tablist')).getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    const panel = within(dialog).getByRole('tabpanel');
    expect(tabs[0]).toHaveAttribute('aria-controls', panel.id);
    act(() => tabs[0]!.focus());
    fireEvent.keyDown(tabs[0]!, { key: 'End' });
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    expect(store.getState().libTab).toBe('collections');
    expect(await structuralViolations(dialog)).toEqual([]);
  });
});

describe('command palette semantics (B5)', () => {
  /*
   * The palette is the Untitled UI PRO command menu now: a react-aria Autocomplete over a
   * ListBox. Two expectations changed with it, deliberately:
   *   - the active option is marked `data-focused`, not `aria-selected="true"`. The list
   *     has no selection (`selectionMode="none"`, rows run actions), and aria-selected on
   *     a row the user has only arrowed to told a screen reader it was chosen;
   *   - the first option becomes active on the first arrow press here. In a browser it
   *     does so as soon as the user types (react-aria keys that off `beforeinput`, which
   *     `fireEvent.change` does not send), and e2e covers that path.
   */
  it('exposes results as a listbox of options driven by aria-activedescendant', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openLayer('palette'));
    const input = await screen.findByRole('combobox', { name: 'Type a command or search icons…' });
    // Empty query: every action is listed, so there are rows to move between.
    const listbox = screen.getByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options.length).toBeGreaterThan(1);
    expect(input).toHaveAttribute('aria-controls', listbox.id);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', options[0]!.id);
    expect(options[0]).toHaveAttribute('data-focused', 'true');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', within(listbox).getAllByRole('option')[1]!.id);

    expect(await structuralViolations(screen.getByRole('dialog'))).toEqual([]);
  });

  it('runs the active option on Enter and closes', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openLayer('palette'));
    const input = await screen.findByRole('combobox');
    const before = store.getState().theme;
    fireEvent.change(input, { target: { value: 'theme' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyUp(input, { key: 'Enter' });
    expect(store.getState().theme).not.toBe(before);
    expect(store.getState().layer).not.toBe('palette');
  });
});
