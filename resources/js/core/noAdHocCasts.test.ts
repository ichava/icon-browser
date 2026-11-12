import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Re-audit F-15: the window globals (`ichava`, `ichavaBoot`, `__ichavaHandle`) are declared once
 * (`src/app/window.d.ts`), so no file casts `window` to reach them, and the SVG policy is
 * narrowed by a type guard rather than cast.
 */
const root = join(__dirname, '..');
const walk = (d: string): string[] =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const sources = walk(root).filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && !f.includes(`${join('js', 'test')}`));

describe('ad hoc casts', () => {
  it('reads the source tree', () => {
    expect(sources.length).toBeGreaterThan(200);
  });

  it('casts window nowhere', () => {
    const hits = sources.filter((f) => /\(window as unknown as/.test(readFileSync(f, 'utf8'))).map((f) => relative(root, f));
    expect(hits).toEqual([]);
  });

  it('narrows the SVG policy with a guard, not a cast', () => {
    expect(readFileSync(join(root, 'modules/svg/domain/svgPolicy.ts'), 'utf8')).not.toContain('as unknown as SvgPolicy');
  });
});
