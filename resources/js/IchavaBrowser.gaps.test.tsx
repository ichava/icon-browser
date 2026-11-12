import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig, CONFIG_DEFAULTS } from './core/config';
import { CatalogIndex as IconRepository } from '@/modules/catalog';
import { MESSAGES, translate, type Locale } from './core/i18n';
import { play, MOTION_PRESETS } from './core/MotionEngine';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';
import pkg from '../package.json';

/**
 * The gaps found by the A6 follow-up review (ichava `.claude/design/react-ui/audits/a6/A6-gaps.md`), one
 * describe per finding. Each failed on main before its fix.
 */

const t = (k: string, v?: Record<string, string | number>) => translate('en', k, v);

function mount(opts: { state?: Record<string, unknown>; syncUrl?: boolean; urlPrefix?: string; manageDocument?: boolean } = {}) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential', ...(opts.state ?? {}) });
  const view = render(
    <IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} syncUrl={opts.syncUrl} urlPrefix={opts.urlPrefix} manageDocument={opts.manageDocument} />,
  );
  return { store, view };
}

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

describe('G3: shortcuts belong to the mount they happen in', () => {
  it('a key pressed outside every mount reaches none of them when the browser does not own the page', async () => {
    const a = mount();
    const b = mount();
    await screen.findAllByRole('grid');
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(a.store.getState().layer).toBeNull();
    expect(b.store.getState().layer).toBeNull();
  });

  it('a key pressed inside one mount opens only that mount\'s palette', async () => {
    const a = mount();
    const b = mount();
    const grids = await screen.findAllByRole('grid');
    fireEvent.keyDown(grids[0]!, { key: 'k', ctrlKey: true });
    expect(a.store.getState().layer).toBe('palette');
    expect(b.store.getState().layer).toBeNull();
  });

  it('the standalone page (manageDocument) still takes keys pressed on the body', async () => {
    const a = mount({ manageDocument: true });
    await screen.findByRole('grid');
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(a.store.getState().layer).toBe('palette');
  });
});

describe('G4: reserved browser shortcuts are left alone', () => {
  it('Ctrl/Cmd+R is not prevented, so the page still reloads', async () => {
    mount({ manageDocument: true });
    await screen.findByRole('grid');
    const reload = new KeyboardEvent('keydown', { key: 'r', ctrlKey: true, bubbles: true, cancelable: true });
    document.body.dispatchEvent(reload);
    expect(reload.defaultPrevented).toBe(false);
  });

  it('Ctrl/Cmd+D is not prevented and does not toggle DevTools, so the bookmark key still works (R-18)', async () => {
    const { store } = mount({ manageDocument: true });
    await screen.findByRole('grid');
    for (const mod of [{ ctrlKey: true }, { metaKey: true }]) {
      const bookmark = new KeyboardEvent('keydown', { key: 'd', ...mod, bubbles: true, cancelable: true });
      document.body.dispatchEvent(bookmark);
      expect(bookmark.defaultPrevented).toBe(false);
    }
    expect(store.getState().devtools.open).toBe(false);
  });

  it('DevTools toggles on Shift+Mod+D instead (R-18)', async () => {
    const { store } = mount({ manageDocument: true });
    await screen.findByRole('grid');
    const open = new KeyboardEvent('keydown', { key: 'D', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true });
    act(() => { document.body.dispatchEvent(open); });
    expect(open.defaultPrevented).toBe(true);
    expect(store.getState().devtools.open).toBe(true);
    act(() => { document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'D', metaKey: true, shiftKey: true, bubbles: true, cancelable: true })); });
    expect(store.getState().devtools.open).toBe(false);
  });

  it('the reset-filters confirm is reachable on Shift+Mod+Backspace and is translated', async () => {
    const { store } = mount({ manageDocument: true, state: { locale: 'es' } });
    await screen.findByRole('grid');
    fireEvent.keyDown(document.body, { key: 'Backspace', ctrlKey: true, shiftKey: true });
    expect(store.getState().confirm?.title).toBe(translate('es', 'toolbar.resetTitle'));
  });
});

describe('G7: the permalink keeps the host URL and the mount\'s prefix', () => {
  it('copies the current URL with only the icon parameter added', async () => {
    window.history.replaceState(null, '', '/host?ui=react#top');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { store } = mount({ syncUrl: true, urlPrefix: 'ich_' });
    await screen.findByRole('grid');
    act(() => store.getState().openDetail(1));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: t('tile.copyPermalink') }));
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
    const url = new URL(writeText.mock.calls[0]![0] as string);
    expect(url.pathname).toBe('/host');
    expect(url.searchParams.get('ui')).toBe('react');
    expect(url.searchParams.get('ich_icon')).toBe('1');
    expect(url.hash).toBe('#top');
  });

  it('offers no permalink when the mount does not read the URL', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openDetail(1));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByRole('button', { name: t('tile.copyPermalink') })).toBeNull();
  });
});

describe('G8: popovers carry their own name', () => {
  it('the appearance popover is named for what it is, not "Popover"', async () => {
    mount();
    await screen.findByRole('grid');
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${t('appearance.title')}`) }));
    expect(await screen.findByRole('dialog', { name: t('appearance.title') })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Popover' })).toBeNull();
  });
});

describe('G9: every way of opening an icon is recorded', () => {
  it('opening the detail records a view, whoever opened it', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openDetail(3));
    expect(store.getState().history[0]).toMatchObject({ id: 3, action: 'viewed' });
  });
});

describe('G10: search', () => {
  const repo = new IconRepository(catalog);
  const names = (search: string) => repo.filtered({ search }).map((i) => i.id);
  it('ignores surrounding whitespace', () => {
    expect(names(' home ')).toEqual(names('home'));
    expect(names('home')).toEqual([1]);
  });
  it('matches every word, in any order', () => {
    expect(names('mail email')).toEqual([3]);
    expect(names('email mail')).toEqual([3]);
  });
  it('finds an icon by the pack:name ref the UI shows and copies', () => {
    expect(names('tabler:home')).toEqual([1]);
  });
});

describe('G11: no English left in the other locales', () => {
  const keys = (prefix: string) => Object.keys(MESSAGES.en).filter((k) => k.startsWith(prefix));
  it('export formats, copy formats and snippet tabs have message keys', () => {
    for (const f of CONFIG_DEFAULTS.toolbar.exportFormats) expect(MESSAGES.en[`export.${f.id}`], f.id).toBeTruthy();
    expect(keys('snippetTab.').length).toBeGreaterThanOrEqual(5);
    expect(MESSAGES.en['clipboard.copyFailed']).toBeTruthy();
  });
  it('every locale translates them', () => {
    const wanted = [...keys('export.'), ...keys('snippetTab.'), ...keys('copyFormat.'), 'clipboard.copyFailed'];
    for (const loc of Object.keys(MESSAGES) as Locale[]) for (const k of wanted) expect(MESSAGES[loc]?.[k], `${loc} ${k}`).toBeTruthy();
  });
  it('no toast or confirm is written with an English literal', () => {
    for (const f of ['src/hooks/useShortcuts.ts', 'src/hooks/useClipboard.ts']) {
      const src = readFileSync(f, 'utf8');
      expect(src, f).not.toMatch(/showToast\(\s*'[A-Z]/);
      expect(src, f).not.toMatch(/(title|body|confirmLabel):\s*'[A-Z]/);
    }
  });
});

describe('G12/G13: no stale literals', () => {
  it('the version defaults to this package\'s version, and the licence is read from config', () => {
    expect(CONFIG_DEFAULTS.meta.version).toBe(pkg.version);
    for (const f of ['src/components/settings/SettingsDialog.tsx', 'src/components/about/AboutDialog.tsx', 'src/core/boot.ts']) {
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/1\.4\.0|· MIT</);
    }
  });
  it('no icon count older than the catalog is written down', () => {
    for (const f of ['index.html', 'public/data/app-config.json', 'src/core/config.ts', 'README.md']) {
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/127,000|128,000/);
    }
  });
  it('the bootsplash names no pack and prints no count it did not measure', () => {
    // It named five packs with fixed counts (two of them private) and printed a fixed
    // 127,262. The figures come from the loaded catalog now (boot/catalogFigures.ts).
    const src = readFileSync('src/components/boot/bootsplashConfig.ts', 'utf8') + readFileSync('src/core/boot.ts', 'utf8');
    expect(src).not.toMatch(/icon-sets-|tabler-icons|metronic-icons|flag-icons/);
    expect(src).not.toMatch(/\b\d{1,3}(,\d{3})+\b|\b(?:127262|121314|10567|6238)\b/);
  });
});

describe('G16: the in-app reduce-motion setting stops the motion preview', () => {
  it('play() does not animate when the mount asks for reduced motion', () => {
    // The OS preference is off, so only the mount's own setting can stop it. (The test
    // setup's matchMedia stub may answer "reduce", which would pass this vacuously.)
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }));
    document.documentElement.removeAttribute('data-reduce-motion');
    const el = document.createElement('div');
    const animate = vi.fn(() => ({ cancel() {}, finished: Promise.resolve() }));
    (el as unknown as { animate: typeof animate }).animate = animate;
    const preset = MOTION_PRESETS.find((p) => !p.draw && !p.perChild && p.keyframes.length > 0)!;
    expect(play(el, preset, { speed: 1, easing: 'ease', reduceMotion: true } as never)).toBeNull();
    expect(animate).not.toHaveBeenCalled();
    // Control: without the setting it does animate, so the assertion above can fail.
    play(el, preset, { speed: 1, easing: 'ease' });
    expect(animate).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('G18: the detail dialog has a heading', () => {
  it('names the icon in a heading inside the dialog', async () => {
    const { store } = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openDetail(1));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'home' })).toBeInTheDocument();
  });
});

