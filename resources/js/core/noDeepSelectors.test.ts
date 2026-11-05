import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * `:deep(...)` is Vue single-file-component syntax. In a plain stylesheet a browser does not know
 * it and drops the whole rule, so every selector written with it silently styled nothing (26 of
 * them in ichava.scss until 2026-11-05). Outside a `.vue` file, write the descendant selector.
 */
const root = resolve(process.cwd());
const DIRS = ['resources/assets', 'resources/js', 'public/assets/css'];

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((e) => {
    const p = join(d, e);
    if (e === 'node_modules') return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const sheets = DIRS.flatMap((d) => walk(join(root, d))).filter((f) => /\.(s?css)$/.test(f));

describe('stylesheets outside .vue files', () => {
  it('reads the stylesheets it guards', () => {
    // Floor: ichava.scss and the compiled inertia-app.css at least.
    expect(sheets.length).toBeGreaterThanOrEqual(2);
    expect(sheets.map((f) => relative(root, f))).toContain('resources/assets/styles/ichava.scss');
  });

  it('use no Vue-only :deep( selector', () => {
    const offenders = sheets.filter((f) => readFileSync(f, 'utf8').includes(':deep(')).map((f) => relative(root, f));
    expect(offenders).toEqual([]);
  });
});
