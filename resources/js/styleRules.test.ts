import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Two of the owner's style rules, checked over every source file that can carry a style:
 *
 *   1. No font weight above 600 (Sim, 2026-10-30: "no heavy bold"). Tailwind's
 *      `font-semibold` and `font-bold` are capped at the token (500 and 600 in
 *      `styles/ichava-theme.css`), so the check is for the escapes: an arbitrary
 *      `font-[700]`, `font-extrabold`/`font-black`, an inline `fontWeight`, or a CSS
 *      `font-weight` declaration.
 *   2. Nothing underlines on hover (Sim, 2026-10-27: "buttons shouldnt underline on hover,
 *      change of hover color is sufficient"): no `hover:underline` utility and no `:hover`
 *      rule that sets an underline.
 *
 * The walk counts what it read and fails below a floor, so a moved `src/` cannot pass by
 * inspecting nothing.
 */

// The repository root. The source is resources/js since react consolidation 3d (2026-11-12), and
// the standalone app's two pages wait with the other imported root files.
const ROOT = join(__dirname, '..', '..');
const DIRS = ['resources/js'];
const EXTRA = ['.dev/imported/react-icon-browser/index.html', '.dev/imported/react-icon-browser/embedded.html'];
const EXT = /\.(tsx?|css|html)$/;
const MIN_FILES = 150;
const MAX_WEIGHT = 600;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXT.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

const files = [...DIRS.flatMap((d) => walk(join(ROOT, d))), ...EXTRA.map((f) => join(ROOT, f))];
const sources = files.map((f) => ({ file: relative(ROOT, f), text: readFileSync(f, 'utf8') }));

function weightOf(token: string): number {
  const t = token.toLowerCase();
  if (t === 'bold') return 700;
  if (t === 'bolder') return 900;
  return Number(t);
}

/** Every font weight a file sets, with the line it sits on. */
function heavyWeights(text: string): string[] {
  const hits: string[] = [];
  const patterns = [
    /\bfont-\[(\d{3})\]/g,
    /\bfont-(extrabold|black)\b/g,
    /fontWeight:\s*['"]?(\d{3}|bold|bolder)\b/g,
    /font-weight:\s*(\d{3}|bold|bolder)\b/g,
    /--font-weight-[a-z]+:\s*(\d{3})\b/g,
  ];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const w = m[1] === 'extrabold' ? 800 : m[1] === 'black' ? 900 : weightOf(m[1] ?? '0');
      if (w > MAX_WEIGHT) hits.push(m[0]);
    }
  }
  return hits;
}

/** Every hover underline a file declares. */
function hoverUnderlines(text: string): string[] {
  const hits = [...text.matchAll(/\b[\w-]*hover:underline\b/g)].map((m) => m[0]);
  for (const m of text.matchAll(/([^{}]*:hover[^{}]*)\{([^{}]*)\}/g)) {
    if (/text-decoration(-line)?\s*:[^;]*underline/.test(m[2] ?? '')) hits.push((m[1] ?? '').trim());
  }
  return hits;
}

describe('style rules', () => {
  it(`reads at least ${MIN_FILES} source files`, () => {
    expect(sources.length).toBeGreaterThanOrEqual(MIN_FILES);
  });

  it('caps every font weight at 600', () => {
    const found = sources.flatMap(({ file, text }) => heavyWeights(text).map((h) => `${file}: ${h}`));
    expect(found).toEqual([]);
  });

  it('caps the Tailwind weight tokens the components use', () => {
    const theme = sources.find((s) => s.file.endsWith('styles/ichava-theme.css'))!.text;
    expect(theme).toMatch(/--font-weight-semibold:\s*500;/);
    expect(theme).toMatch(/--font-weight-bold:\s*600;/);
  });

  it('never underlines on hover', () => {
    const found = sources.flatMap(({ file, text }) => hoverUnderlines(text).map((h) => `${file}: ${h}`));
    expect(found).toEqual([]);
  });

  it('can fail: the matchers catch each escape', () => {
    expect(heavyWeights('<b className="font-[700]" />')).toHaveLength(1);
    expect(heavyWeights('font-extrabold')).toHaveLength(1);
    expect(heavyWeights('style={{ fontWeight: 800 }}')).toHaveLength(1);
    expect(heavyWeights('.x { font-weight: bold; }')).toHaveLength(1);
    expect(heavyWeights('.x { font-weight: 600; } font-[500] fontWeight: 600')).toEqual([]);
    expect(hoverUnderlines('<a className="hover:underline" />')).toHaveLength(1);
    expect(hoverUnderlines('a:hover { color: red; text-decoration: underline; }')).toHaveLength(1);
    expect(hoverUnderlines('a:hover { color: red; } a { text-decoration: underline; }')).toEqual([]);
  });
});
