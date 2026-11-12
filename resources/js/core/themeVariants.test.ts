import { describe, expect, it } from 'vitest';
import { toIcon, type RawIcon } from '@ichava/js-ui-kernel';

import { iconForTheme, themeVariantsOf, withThemeVariants } from './themeVariants';

const raw = (over: Record<string, unknown> = {}): RawIcon =>
  ({
    id: 7,
    package: 'acme/scenes',
    name: 'office',
    category: 'illustrations',
    variant: 'default',
    kind: 'illustration',
    svg_url: '/ichava/api/v1/icons/7/svg',
    ...over,
  }) as RawIcon;

describe('theme variants (contract §5.4, K-js9)', () => {
  it('carries the twins from the wire, and reads PHP’s [] as none', () => {
    const icon = withThemeVariants(toIcon(raw()), raw({ theme_variants: { dark: { svg_url: '/ichava/api/v1/icons/7/svg?theme=dark' } } }));
    expect(themeVariantsOf(icon)).toEqual({ dark: { svgUrl: '/ichava/api/v1/icons/7/svg?theme=dark', svgContent: null } });
    expect(themeVariantsOf(withThemeVariants(toIcon(raw()), raw({ theme_variants: [] })))).toBeUndefined();
    expect(themeVariantsOf(withThemeVariants(toIcon(raw()), raw()))).toBeUndefined();
    // A twin with neither a URL nor markup is no twin.
    expect(themeVariantsOf(withThemeVariants(toIcon(raw()), raw({ theme_variants: { dark: { svg_url: null } } })))).toBeUndefined();
  });

  it('swaps in the twin for its theme, and keeps the light file otherwise', () => {
    const icon = withThemeVariants(toIcon(raw()), raw({ theme_variants: { dark: { svg_url: '/dark.svg', svg_content: '<svg viewBox="0 0 4 4"></svg>' } } }));
    const dark = iconForTheme(icon, 'dark');
    expect(dark.svgUrl).toBe('/dark.svg');
    expect(dark.svgContent).toBe('<svg viewBox="0 0 4 4"></svg>');
    expect(dark.id).toBe(icon.id);
    expect(dark.kind).toBe('illustration');
    expect(iconForTheme(icon, 'light')).toBe(icon);
  });

  it('returns the same object for the same icon and theme, so render caches hold', () => {
    const icon = withThemeVariants(toIcon(raw()), raw({ theme_variants: { dark: { svg_url: '/dark.svg' } } }));
    expect(iconForTheme(icon, 'dark')).toBe(iconForTheme(icon, 'dark'));
    const plain = toIcon(raw());
    expect(iconForTheme(plain, 'dark')).toBe(plain);
  });

  it('does not carry the parent’s inline markup into a twin that only has a URL', () => {
    const icon = withThemeVariants(toIcon(raw({ svg_content: '<svg><path d="M0 0"/></svg>' })), raw({ theme_variants: { dark: { svg_url: '/dark.svg' } } }));
    const dark = iconForTheme(icon, 'dark');
    expect(dark.svgContent).toBeNull();
    expect(dark.svgUrl).toBe('/dark.svg');
  });
});
