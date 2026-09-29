import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * shadcn was dropped for Untitled UI. Its CLI, its Radix/cmdk primitives and the CSS that
 * corrected their defaults were removed; this keeps them from drifting back in through a
 * copied snippet or a `shadcn add`. CHANGELOG history is not scanned.
 */
const ROOT = resolve(process.cwd(), 'resources/js');
const FORBIDDEN = /shadcn|\bcmdk\b|@radix-ui|class-variance-authority|data-slot=/i;

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(tsx?|css)$/.test(name) && !path.endsWith('noShadcn.test.ts') ? [path] : [];
  });
}

describe('no shadcn remnants', () => {
  it('keeps the component sources free of shadcn, Radix and cmdk', () => {
    const files = sources(ROOT);

    // A walk that found nothing would pass; pin the size of what was inspected.
    expect(files.length).toBeGreaterThan(129);

    const offenders = files.filter((f) => FORBIDDEN.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('declares none of their packages', () => {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

    expect(names.filter((n) => FORBIDDEN.test(n))).toEqual([]);
  });
});
