import { assetUrl } from '@/core/SvgFidelity';
import { sanitizeSvg } from './sanitizeSvg';
import { monochromeToCurrentColor } from './monochrome';
import { fetchSvgFile } from './svgText';
import type { Icon } from '@ichava/js-ui-kernel';

export interface SvgParts {
  body: string; // inner markup (no outer <svg>)
  viewBox: string;
  /**
   * The body with black paint rewritten to `currentColor`, when the icon is monochrome
   * black (see core/monochrome). Absent for every other icon. Used by the dark-mode
   * preview so an openmoji-black glyph does not vanish (FINDINGS B7).
   */
  monoBody?: string;
  /**
   * The root `<svg>`'s presentation attributes (fill, stroke and friends), serialised
   * as ` name="value"` pairs. `body` drops the root, so anything that rebuilds a
   * standalone SVG or a `<symbol>` from it needs these too, or an outline icon loses
   * its `fill="none"` and paints solid (A6-gaps G2). Empty when the root has none
   * (a flag paints every shape itself); absent only when no SVG was parsed.
   */
  rootAttrs?: string;
}

/** Root attributes that paint the icon and are inherited by its children. */
const PAINT_ATTRS = [
  'fill',
  'fill-rule',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-opacity',
  'clip-rule',
  'color',
  'opacity',
];

function rootPaint(svg: string): string {
  const root = /<svg\b[^>]*>/i.exec(svg)?.[0] ?? '';
  let out = '';
  for (const name of PAINT_ATTRS) {
    const m = new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i').exec(root);
    if (m) out += ` ${name}="${m[1]}"`;
  }
  return out;
}

const cache = new Map<string, SvgParts>();
const pending = new Map<string, Promise<SvgParts>>();

function innerBody(svg: string): string {
  const open = svg.indexOf('>', svg.indexOf('<svg'));
  const close = svg.lastIndexOf('</svg>');
  const body = open >= 0 && close > open ? svg.slice(open + 1, close) : svg;
  // drop the decorative tabler bounding rect so recolouring is clean
  return body.replace(/<path\s+stroke="none"[^>]*fill="none"[^>]*><\/path>/gi, '').replace(/<path\s+stroke="none"[^>]*fill="none"[^>]*\/>/gi, '').trim();
}

function parse(raw: string, fallbackViewBox: string): SvgParts {
  const svg = sanitizeSvg(raw);
  const viewBox = /viewBox\s*=\s*"([^"]+)"/i.exec(svg)?.[1] ?? fallbackViewBox;
  const parts: SvgParts = { body: innerBody(svg), viewBox };
  parts.rootAttrs = rootPaint(svg);
  const mono = monochromeToCurrentColor(svg);
  if (mono !== svg) parts.monoBody = innerBody(mono);
  return parts;
}

/** Fetch (or read inline) an icon's SVG parts, cached by URL. */
export function getSvgParts(icon: Icon): SvgParts | Promise<SvgParts> {
  if (icon.svgContent) return parse(icon.svgContent, icon.viewBox);
  const url = assetUrl(icon.svgUrl ?? '');
  if (!url) return { body: '', viewBox: icon.viewBox };
  const hit = cache.get(url);
  if (hit) return hit;
  const inflight = pending.get(url);
  if (inflight) return inflight;
  const p = Promise.resolve(fetchSvgFile(url))
    .then((t) => {
      const parts = parse(t, icon.viewBox);
      cache.set(url, parts);
      pending.delete(url);
      return parts;
    })
    .catch(() => {
      const empty = { body: '', viewBox: icon.viewBox };
      cache.set(url, empty);
      pending.delete(url);
      return empty;
    });
  pending.set(url, p);
  return p;
}
