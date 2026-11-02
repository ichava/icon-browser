import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { minificationProblems } from './minifiedBundle';

/**
 * The browser code this public repository ships is fully minified: the vendored
 * react-icon-browser build and the page bundle built from it (see `minifiedBundle.ts`).
 */
const vendored = resolve(process.cwd(), 'resources/vendor/react-icon-browser/index.js');
const page = resolve(process.cwd(), 'public/assets/js/inertia-app.js');

describe('minificationProblems', () => {
  it('reports every way a readable bundle shows', () => {
    const readable = `// a comment\n/* a block */\nfunction resolveConfig(input) {\n  const merged = { ...input };\n  return merged;\n}\n//# sourceMappingURL=index.js.map\n`.repeat(50);
    expect(minificationProblems(readable)).toEqual([
      'names a source map (sourceMappingURL)',
      expect.stringMatching(/^averages \d+ bytes a line/),
      expect.stringMatching(/^\d+ indented lines/),
      expect.stringMatching(/^50 block comments/),
      expect.stringMatching(/^100 of 100 declared names/),
    ]);
  });

  it('passes a minified bundle with licence comments, pure annotations and template newlines', () => {
    const minified = '/*! licence */import{a as b}from"react";function c(d){return/* @__PURE__ */b(d)}'.padEnd(20_000, ';') + '`\n  x`';
    expect(minificationProblems(minified)).toEqual([]);
  });
});

const walk = (d: string): string[] =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));

/** Every file this repository ships browser code from: the vendored library and the built assets. */
const shipped = ['resources/vendor/react-icon-browser', 'public'].flatMap((d) => walk(resolve(process.cwd(), d)));

describe('shipped browser code', () => {
  it('holds no source map, nor any file carrying map sources', () => {
    // Floor: the vendored library alone is 200 files; a walk that reads nothing must fail.
    expect(shipped.length).toBeGreaterThan(200);
    expect(shipped.filter((f) => f.endsWith('.map'))).toEqual([]);
    const text = shipped.filter((f) => /\.(js|mjs|css|json|html)$/.test(f));
    expect(text.filter((f) => /sourcesContent|sourceMappingURL/.test(readFileSync(f, 'utf8')))).toEqual([]);
  });

  it('vendors react-icon-browser fully minified', () => {
    expect(existsSync(vendored)).toBe(true);
    expect(minificationProblems(readFileSync(vendored, 'utf8'))).toEqual([]);
  });

  it('builds the page bundle fully minified', () => {
    expect(existsSync(page)).toBe(true);
    expect(minificationProblems(readFileSync(page, 'utf8'))).toEqual([]);
  });
});
