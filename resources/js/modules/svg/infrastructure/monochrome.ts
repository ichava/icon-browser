/**
 * Let a monochrome icon that hard-codes black follow the text colour (FINDINGS B7).
 *
 * The browser-side twin of core's opt-in `ConvertsMonochromeToCurrentColor` pass
 * (ichava/core#114). An icon drawn as `fill="#000"` renders black whatever the page
 * does, so on a dark background it vanishes -- openmoji-black's coconut and
 * deaf-woman are the cases the audit saw. Rewriting that black to `currentColor`
 * makes it inherit the surrounding `color`.
 *
 * The rules are core's, deliberately, so a static catalog and a REST catalog with the
 * flag on paint the same icon the same way:
 *
 *  - Only safe when EVERY paint is black or neutral. In a multicolour icon the black
 *    is part of the drawing, so any other colour, any `url(...)` (gradient, pattern)
 *    returns the input untouched.
 *  - A `<style>` element returns it untouched too: its selectors are not evaluated.
 *  - Only explicit black (or a near-black neutral grey, see `isBlack`) is rewritten. An
 *    unpainted element also renders black by default; adding paint to it is a different,
 *    broader change.
 *
 * Pure apart from `DOMParser`/`XMLSerializer`, which every browser and jsdom provide.
 * Returns the input unchanged when it cannot be parsed or nothing applies.
 */

const PAINT_PROPERTIES = ['fill', 'stroke', 'color', 'stop-color', 'flood-color', 'lighting-color'];
const NEUTRAL_PAINTS = new Set(['none', 'transparent', 'currentcolor', 'inherit', 'unset', 'initial']);
const BLACK = /^(?:#000(?:000)?|black|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))$/i;
const HEX = /^#(?:([0-9a-f])([0-9a-f])([0-9a-f])|([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))$/i;
const IMPORTANT = /\s*!important\s*$/i;

/**
 * Black, or the near-black neutral grey emoji sets draw "black" glyphs in: every channel
 * at most 0x40 and within 0x18 of the others. Twemoji's heavy dollar sign is #292F33,
 * which pure-black matching missed, so in dark mode it stayed #292F33 on a #0a0a0a tile
 * and all but vanished. A dark colour with a hue (navy, maroon) is still a colour.
 */
function isBlack(v: string): boolean {
  const t = v.trim();
  if (BLACK.test(t)) return true;
  const m = HEX.exec(t);
  if (!m) return false;
  const ch = (m[1] ? [m[1] + m[1], m[2]! + m[2], m[3]! + m[3]] : [m[4]!, m[5]!, m[6]!]).map((h) => parseInt(h, 16));
  return Math.max(...ch) <= 0x40 && Math.max(...ch) - Math.min(...ch) <= 0x18;
}

/** Every paint value on an element: presentation attributes, then `style` declarations. */
function paintValues(el: Element): string[] {
  const out: string[] = [];
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    if (PAINT_PROPERTIES.includes(name)) out.push(attr.value.trim());
    if (name === 'style') {
      for (const decl of attr.value.split(';')) {
        const i = decl.indexOf(':');
        if (i < 0) continue;
        if (PAINT_PROPERTIES.includes(decl.slice(0, i).trim().toLowerCase())) out.push(decl.slice(i + 1).replace(IMPORTANT, '').trim());
      }
    }
  }
  return out;
}

function rewrite(el: Element): void {
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    if (PAINT_PROPERTIES.includes(name) && isBlack(attr.value)) el.setAttribute(attr.name, 'currentColor');
    if (name === 'style') {
      const decls = attr.value.split(';').map((decl) => {
        const i = decl.indexOf(':');
        if (i < 0) return decl;
        const prop = decl.slice(0, i);
        const value = decl.slice(i + 1);
        if (!PAINT_PROPERTIES.includes(prop.trim().toLowerCase())) return decl;
        const important = IMPORTANT.test(value);
        return isBlack(value.replace(IMPORTANT, '')) ? `${prop}:currentColor${important ? ' !important' : ''}` : decl;
      });
      el.setAttribute(attr.name, decls.join(';'));
    }
  }
}

function parse(svg: string): Document | null {
  if (typeof DOMParser === 'undefined') return null;
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) return null;
  return doc;
}

/** True when every paint in `svg` is black or neutral and at least one is black. */
export function isMonochromeBlack(svg: string): boolean {
  const doc = parse(svg);
  if (!doc) return false;
  if (doc.getElementsByTagName('style').length) return false;
  let sawBlack = false;
  for (const el of [doc.documentElement, ...Array.from(doc.documentElement.getElementsByTagName('*'))]) {
    for (const v of paintValues(el)) {
      if (isBlack(v)) sawBlack = true;
      else if (!NEUTRAL_PAINTS.has(v.toLowerCase())) return false;
    }
  }
  return sawBlack;
}

/** Rewrite pure-black paint to `currentColor` when the icon is monochrome; else return it unchanged. */
export function monochromeToCurrentColor(svg: string): string {
  if (!isMonochromeBlack(svg)) return svg;
  const doc = parse(svg)!;
  for (const el of [doc.documentElement, ...Array.from(doc.documentElement.getElementsByTagName('*'))]) rewrite(el);
  return new XMLSerializer().serializeToString(doc.documentElement);
}
