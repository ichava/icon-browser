import type { StyleObject } from './types';
import type { Icon } from '@ichava/js-ui-kernel';
import type { RenderStrategy } from './types';
/** Resolve the public URL for an icon's asset (static mode: under public/). */
export declare function assetUrl(file: string): string;
/**
 * Encode inline SVG as a data URI for mask/image use. A catalog can carry
 * `svgContent` without an `svgUrl` (Inertia pages do, and so may a host passing a
 * static catalog); without this the mask resolves to an empty `url("/")` and tiles
 * render blank. Image-context SVG cannot run scripts; encoding (not sanitizing) is
 * enough. Ported from ichava/icon-browser.
 */
export declare function svgDataUrl(svg: string): string;
/**
 * SvgFidelity — the single place that decides how an icon is painted.
 * Own-colour icons (flags/emoji) render untouched as an image; currentColor
 * icons render through a CSS mask so they stay themeable. `ownColor` is baked
 * into the icon data. Stateless, pure.
 */
export declare class SvgFidelity {
    /**
     * The URL to paint from: the API/static asset when the icon has one, else a data
     * URI built from its inline content. Never '/': an icon with neither renders
     * nothing instead of fetching the page itself as a mask.
     */
    private url;
    resolve(icon: Icon, color: string | null): RenderStrategy;
    toStyle(s: RenderStrategy, size: number): StyleObject;
}
export declare const fidelity: SvgFidelity;
