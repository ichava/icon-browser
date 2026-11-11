import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { iconPageBase } from './browserPath';

describe('iconPageBase', () => {
  it('follows the path the server shares', () => {
    expect(iconPageBase({ prefix: 'ichava', browserPath: '/app' })).toBe('/app');
    expect(iconPageBase({ prefix: 'ichava', browserPath: '/tools/icons/' })).toBe('/tools/icons');
  });

  it('falls back to the prefix for a page rendered by an older server', () => {
    expect(iconPageBase({ prefix: 'custom' })).toBe('/custom/icons');
    expect(iconPageBase({ prefix: 'custom', browserPath: '' })).toBe('/custom/icons');
  });
});

describe('the pages', () => {
  // Every page that links an icon page builds the base here, never from the prefix.
  const pages = join(__dirname, '..', 'pages');
  const files = (function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : p.endsWith('.tsx') ? [p] : [];
    });
  })(pages);

  it('read the pages they inspect', () => {
    expect(files.length).toBeGreaterThanOrEqual(8);
  });

  it('do not build icon URLs from the prefix', () => {
    const offenders = files.filter((f) => /prefix\}\/icons/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
