import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { IconAsset } from './IconAsset';
import { useStore } from '@/store';
import { mkIcon } from '@/test/fixtures';

/**
 * FINDINGS B7, preview side: in dark mode an own-colour icon whose every paint is
 * black (openmoji-black's coconut) is repainted in the text colour, so it does not
 * vanish on the dark canvas. Multicolour icons and light mode keep the original path.
 */

const MONO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><path fill="none" stroke="#000000" d="M1 1h70"/></svg>';
const MULTI = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path fill="#55ACEE" d="M0 0h1"/><path fill="#000" d="M1 1h1"/></svg>';

const files: Record<string, string> = { 'assets/mono.svg': MONO, 'assets/multi.svg': MULTI };

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (url: unknown) => {
    const key = Object.keys(files).find((k) => String(url).endsWith(k));
    return new Response(key ? files[key] : '', { status: key ? 200 : 404 });
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  useStore.setState({ theme: 'light', adaptMonochrome: true });
});

const mono = mkIcon({ id: 901, name: 'coconut', package: 'ichava/icon-sets-twemoji', ownColor: true, svgUrl: 'assets/mono.svg' });
const multi = mkIcon({ id: 902, name: 'medal', package: 'ichava/icon-sets-twemoji', ownColor: true, svgUrl: 'assets/multi.svg' });

describe('IconAsset monochrome adaptation (B7)', () => {
  it('repaints a monochrome black icon in the text colour in dark mode', async () => {
    useStore.setState({ theme: 'dark', adaptMonochrome: true });
    const { container } = render(<IconAsset icon={mono} size={24} />);
    await waitFor(() => expect(container.querySelector('svg[data-ichava-mono]')).not.toBeNull());
    const svg = container.querySelector('svg[data-ichava-mono]')!;
    expect(svg.innerHTML).toContain('currentColor');
    expect(svg.innerHTML).not.toMatch(/#000/);
  });

  it('leaves a multicolour icon on its own-colour path', async () => {
    useStore.setState({ theme: 'dark', adaptMonochrome: true });
    const { container } = render(<IconAsset icon={multi} size={24} />);
    await new Promise((r) => setTimeout(r, 20));
    expect(container.querySelector('svg[data-ichava-mono]')).toBeNull();
  });

  it('does nothing in light mode', async () => {
    useStore.setState({ theme: 'light', adaptMonochrome: true });
    const { container } = render(<IconAsset icon={mono} size={24} />);
    await new Promise((r) => setTimeout(r, 20));
    expect(container.querySelector('svg[data-ichava-mono]')).toBeNull();
  });

  it('can be switched off', async () => {
    useStore.setState({ theme: 'dark', adaptMonochrome: false });
    const { container } = render(<IconAsset icon={mono} size={24} />);
    await new Promise((r) => setTimeout(r, 20));
    expect(container.querySelector('svg[data-ichava-mono]')).toBeNull();
  });

  it('is on by default', () => {
    expect(useStore.getState().adaptMonochrome).toBe(true);
  });
});

describe('IconAsset theme twins (K-js9)', () => {
  const LIGHT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect id="light-file" fill="#f5f5f5" width="8" height="8"/><path fill="#0e7c66" d="M0 0h1"/></svg>';
  const DARK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect id="dark-file" fill="#111111" width="8" height="8"/><path fill="#0e7c66" d="M0 0h1"/></svg>';
  const scene = async () => {
    const { withThemeVariants } = await import('@/core/themeVariants');
    const base = mkIcon({ id: 903, name: 'office', kind: 'illustration', ownColor: true, svgContent: LIGHT, svgUrl: null });
    return withThemeVariants(base, { theme_variants: { dark: { svg_url: null, svg_content: DARK } } });
  };

  it('draws the dark twin in dark mode', async () => {
    useStore.setState({ theme: 'dark', adaptMonochrome: true });
    const { container } = render(<IconAsset icon={await scene()} size={48} />);
    await waitFor(() => expect(container.querySelector('svg[data-ichava-illustration]')).not.toBeNull());
    expect(container.innerHTML).toContain('dark-file');
    expect(container.innerHTML).not.toContain('light-file');
  });

  it('draws the light file in light mode', async () => {
    useStore.setState({ theme: 'light' });
    const { container } = render(<IconAsset icon={await scene()} size={48} />);
    await waitFor(() => expect(container.querySelector('svg[data-ichava-illustration]')).not.toBeNull());
    expect(container.innerHTML).toContain('light-file');
  });
});
