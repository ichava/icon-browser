import { describe, expect, it } from 'vitest';
// @ts-expect-error -- a plain .mjs build script with no declaration file.
import { declarations } from '../../../.dev/browser/brand-bridge.mjs';

/**
 * brand-bridge's declaration scan is one linear pass. It replaced
 * `/(--[\w-]+)\s*:\s*([^;{}]+);/g` and the `/\/\*[\s\S]*?\*\//g` comment strip, both
 * polynomial on hostile input (CodeQL js/polynomial-redos): this pins that it finds
 * exactly what the regexes found, and that hostile input finishes in under 50 ms.
 */
const reference = (css: string) =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)].map((m) => [m[1], m[2]!.trim()]);

describe('brand-bridge declarations()', () => {
  it('matches the regexes it replaced on 50,000 random fragments', () => {
    const pieces = ['--', '-', 'a', 'b9', ' ', '\n', ':', ';', '{', '}', '/*', '*/', 'var(--x)', '#fff', '--color-brand-600'];
    let seed = 3;
    const rand = (n: number) => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) % n;
    };
    for (let i = 0; i < 50_000; i++) {
      let css = '';
      for (let j = rand(18); j > 0; j--) css += pieces[rand(pieces.length)];
      expect(declarations(css), css).toEqual(reference(css));
    }
  });

  it('finishes hostile input in under 50 ms', () => {
    for (const css of [`/${'a/'.repeat(100_000)}`, 'z'.repeat(100_000), `--a:${' '.repeat(100_000)}`, '-'.repeat(100_000), '--a:'.repeat(25_000)]) {
      const start = performance.now();
      declarations(css);
      expect(performance.now() - start).toBeLessThan(50);
    }
  });
});
