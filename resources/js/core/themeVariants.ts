// Theme twins (contract §5.4, K-js9). A pack can ship a dark twin of an item
// (`scene-dark.svg`); icon-browser serves it as `icon.theme_variants.<theme>`, each with
// its own `svg_url` (the same sanitiser and size budget as the parent, `?theme=<theme>`)
// and, when the parent carries markup, its own `svg_content`.
//
// The kernel's `Icon` has no field for them, so they ride beside it under a symbol and
// are read back through `themeVariantsOf`. Nothing here fetches or sanitises: the twin is
// rendered by the same path as any icon, which does both.

import type { Icon, RawIcon, Theme } from '@ichava/js-ui-kernel';

/** One twin, camel-cased: its SVG route, and its markup when the server inlined it. */
export interface ThemeVariant {
  svgUrl: string | null;
  svgContent: string | null;
}

const VARIANTS = Symbol('ichava.themeVariants');
type WithVariants = Icon & { [VARIANTS]?: Readonly<Record<string, ThemeVariant>> };

const str = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);

/**
 * `icon` with the twins `raw.theme_variants` describes. PHP sends `[]` for none, and a
 * twin with neither a URL nor markup is dropped, so an icon with no usable twin is
 * returned unchanged.
 */
export function withThemeVariants(icon: Icon, raw: RawIcon | Record<string, unknown>): Icon {
  const wire = (raw as { theme_variants?: unknown }).theme_variants;
  if (!wire || typeof wire !== 'object' || Array.isArray(wire)) return icon;
  const variants: Record<string, ThemeVariant> = {};
  for (const [theme, v] of Object.entries(wire as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue;
    const svgUrl = str((v as { svg_url?: unknown }).svg_url);
    const svgContent = str((v as { svg_content?: unknown }).svg_content);
    if (svgUrl || svgContent) variants[theme] = { svgUrl, svgContent };
  }
  if (!Object.keys(variants).length) return icon;
  return Object.assign({}, icon, { [VARIANTS]: variants }) as Icon;
}

/** The twins an icon carries, by theme; undefined when it has none. */
export function themeVariantsOf(icon: Icon): Readonly<Record<string, ThemeVariant>> | undefined {
  return (icon as WithVariants)[VARIANTS];
}

const themed = new WeakMap<Icon, Map<string, Icon>>();

/**
 * The icon to draw in `theme`: its twin for that theme, or the icon itself. The twin
 * keeps everything but the markup and the URL, so its kind, colour handling and id are the
 * light file's. Memoised per icon and theme, so a render cache keyed on the object holds.
 */
export function iconForTheme(icon: Icon, theme: Theme): Icon {
  const variant = themeVariantsOf(icon)?.[theme];
  if (!variant) return icon;
  let byTheme = themed.get(icon);
  if (!byTheme) themed.set(icon, (byTheme = new Map()));
  let twin = byTheme.get(theme);
  if (!twin) {
    twin = { ...icon, svgUrl: variant.svgUrl, svgContent: variant.svgContent };
    byTheme.set(theme, twin);
  }
  return twin;
}
