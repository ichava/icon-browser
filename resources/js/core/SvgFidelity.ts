import type { StyleObject } from './types';
import type { Icon } from './model';
import type { RenderStrategy } from './types';

/** Resolve the public URL for an icon's asset (static mode: under public/). */
export function assetUrl(file: string): string {
  if (!file) return '';
  if (/^(https?:)?\//.test(file)) return file; // already absolute / rooted
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}/${file.replace(/^\//, '')}`;
}

/**
 * Encode inline SVG as a data URI for mask/image use. Inertia pages carry
 * `svg_content` but no `svg_url` (the REST endpoint is opt-in), so without
 * this the mask resolves to an empty `url("/")` and tiles render blank.
 * Image-context SVG cannot run scripts; encoding (not sanitizing) is enough.
 */
export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * SvgFidelity — the single place that decides how an icon is painted.
 * Own-colour icons (flags/emoji) render untouched as an image; currentColor
 * icons render through a CSS mask so they stay themeable. `ownColor` is baked
 * into the icon data. Stateless, pure.
 */
export class SvgFidelity {
  /**
   * The URL to paint from: the API/static asset when the icon has one, else
   * a data URI built from the inline content Inertia pages already carry.
   * Never '/': an icon with neither renders nothing instead of fetching the
   * page itself as a mask.
   */
  private url(icon: Icon): string {
    if (icon.svgUrl) return assetUrl(icon.svgUrl);
    if (icon.svgContent) return svgDataUrl(icon.svgContent);
    return '';
  }

  resolve(icon: Icon, color: string | null): RenderStrategy {
    const url = this.url(icon);
    if (icon.ownColor) return { kind: 'image', url };
    return { kind: 'mask', url, color: color ?? 'currentColor' };
  }

  toStyle(s: RenderStrategy, size: number): StyleObject {
    const dim = { width: `${size}px`, height: `${size}px` };
    if (s.kind === 'image') {
      return {
        ...dim,
        backgroundImage: `url("${s.url}")`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      };
    }
    return {
      ...dim,
      backgroundColor: s.color,
      maskImage: `url("${s.url}")`,
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskImage: `url("${s.url}")`,
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
    };
  }
}

export const fidelity = new SvgFidelity();
