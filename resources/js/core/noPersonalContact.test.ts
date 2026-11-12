import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * No personal name or email ships (decided 2026-10-28, finding W-20). The author is
 * Simtabi LLC and the contact is the role address ichava@simtabi.com. This reads the
 * sources, the shipped data, the README and package.json. CHANGELOG history is not scanned.
 */
const ROOT = process.cwd();
// Spelled in pieces: icon-browser's NoPersonalAuthorTest.php reads resources/js too, and would
// otherwise find the pattern itself in this file (react consolidation 3d, 2026-11-12).
const FORBIDDEN = new RegExp(['imani', '@|man', 'yara'].join(''), 'i');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return name === '.DS_Store' || path.endsWith('noPersonalContact.test.ts') ? [] : [path];
  });
}

describe('no personal contact', () => {
  it('names no person in the sources, data, README or package.json', () => {
    const inspected = [
      ...files(resolve(ROOT, 'resources/js')),
      ...files(resolve(ROOT, '.dev/browser/public/data')),
      resolve(ROOT, 'README.md'),
      resolve(ROOT, 'package.json'),
    ];

    // 288 files measured 2026-10-30; a walk that found nothing would pass.
    expect(inspected.length).toBeGreaterThanOrEqual(288);

    const offenders = inspected.filter((f) => FORBIDDEN.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('credits Simtabi LLC as the author', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
    expect(pkg.author).toBe('Simtabi LLC <ichava@simtabi.com> (https://simtabi.com)');
  });
});
