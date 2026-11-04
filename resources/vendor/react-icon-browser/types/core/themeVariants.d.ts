import type { Icon, RawIcon, Theme } from '@ichava/js-ui-kernel';
/** One twin, camel-cased: its SVG route, and its markup when the server inlined it. */
export interface ThemeVariant {
    svgUrl: string | null;
    svgContent: string | null;
}
/**
 * `icon` with the twins `raw.theme_variants` describes. PHP sends `[]` for none, and a
 * twin with neither a URL nor markup is dropped, so an icon with no usable twin is
 * returned unchanged.
 */
export declare function withThemeVariants(icon: Icon, raw: RawIcon | Record<string, unknown>): Icon;
/** The twins an icon carries, by theme; undefined when it has none. */
export declare function themeVariantsOf(icon: Icon): Readonly<Record<string, ThemeVariant>> | undefined;
/**
 * The icon to draw in `theme`: its twin for that theme, or the icon itself. The twin
 * keeps everything but the markup and the URL, so its kind, colour handling and id are the
 * light file's. Memoised per icon and theme, so a render cache keyed on the object holds.
 */
export declare function iconForTheme(icon: Icon, theme: Theme): Icon;
