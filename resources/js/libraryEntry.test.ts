import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * The library barrel must not carry stylesheets (FINDINGS B1).
 *
 * `index.ts` re-exported `mount.tsx`, which imported `theme.css`, so a host importing
 * anything from the package also received `html, body, #root { overflow: hidden;
 * height: 100% }` and every other page of that host stopped scrolling.
 *
 * vitest does not process CSS, so rendering the barrel in jsdom would prove nothing:
 * the rule never reaches the document either way. This walks the real import graph
 * instead. The stylesheet is the consumer's explicit `import '@ichava/react-icon-browser/styles.css'`.
 */

const SRC = dirname(fileURLToPath(import.meta.url));
const EXTS = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];

function resolveSpecifier(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = join(SRC, spec.slice(2));
  else if (spec.startsWith('.')) base = resolve(dirname(from), spec);
  else return null; // a package: not ours to walk
  for (const ext of EXTS) {
    const p = base + ext;
    if (existsSync(p) && (ext !== '' || /\.[a-z]+$/i.test(p))) return p;
  }
  return null;
}

/** Every module reachable from `entry`, following static and dynamic imports and re-exports. */
function reachable(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  const specifiers = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    if (!/\.tsx?$/.test(file)) continue;
    for (const m of readFileSync(file, 'utf8').matchAll(specifiers)) {
      const spec = m[1] ?? m[2] ?? m[3]!;
      const target = resolveSpecifier(file, spec);
      if (target) queue.push(target);
    }
  }
  return seen;
}

describe('library entry', () => {
  const graph = reachable(join(SRC, 'index.ts'));

  it('walks the real graph (guard against a resolver that finds nothing)', () => {
    // The barrel reaches the whole component tree; a broken resolver would report a
    // handful of files and pass the assertion below vacuously.
    expect(graph.size).toBeGreaterThan(80);
    expect(graph.has(join(SRC, 'mount.tsx'))).toBe(true);
    expect(graph.has(join(SRC, 'IchavaBrowser.tsx'))).toBe(true);
  });

  it('imports no stylesheet from anything the barrel reaches', () => {
    const css = [...graph].filter((f) => f.endsWith('.css')).map((f) => relative(SRC, f));
    expect(css).toEqual([]);
  });

  it('leaves the stylesheet to the standalone entries', () => {
    for (const entry of ['main.tsx', 'embedded.tsx']) {
      const css = [...reachable(join(SRC, entry))].filter((f) => f.endsWith('.css')).map((f) => relative(SRC, f));
      expect(css, entry).toContain('styles/theme.css');
    }
  });

  it('keeps the document lock out of the shared theme', () => {
    // The full-height, no-scroll page belongs to the standalone document only.
    const theme = readFileSync(join(SRC, 'styles/theme.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const locks = [...theme.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(
      ([, sel, body]) => /(^|[\s,])(html|body|#root)\b/.test(sel!) && /\boverflow\s*:/.test(body!),
    );
    expect(locks.map(([, sel]) => sel!.trim())).toEqual([]);
  });
});
