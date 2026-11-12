// Guard: `@untitledui/icons` stays out of this package. It was a dependency nothing
// imported (the glyph map is backed by @tabler/icons-react), and it was removed for
// 0.1.0. This fails if package.json lists it again or any source file imports it.
//
// It walks the tree rather than a fixed list, so a new directory is covered, and it
// asserts how many files it read, so a walk that stops matching cannot pass on nothing.

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..', '..');
const SKIP = new Set(['node_modules', 'dist', '.git', 'coverage', 'playwright-report', 'test-results', 'public']);
const EXT = /\.(?:[cm]?[jt]sx?|css|html)$/;
const SELF = relative(ROOT, __filename);
const NAME = ['@untitledui', 'icons'].join('/');
// Any quote style (template literals included) after `from`, `import`, `import(` or
// `require(`, and CSS `@import` with or without `url()`, quoted or not. Biased towards a
// false match: a hit here is cheap to inspect, a miss lets the package back in.
const IMPORT = new RegExp(
  `(?:from\\s*|import\\s*\\(?\\s*|require\\s*\\(\\s*|@import\\s+(?:url\\(\\s*)?)(['"\`]?)${NAME}(?:/[^'"\`)\\s]*)?\\1`,
);

const FORMS = [
  `import { X } from '${NAME}';`,
  `import X from "${NAME}/react";`,
  `import '${NAME}';`,
  `const m = await import(\`${NAME}\`);`,
  `const m = require(\`${NAME}\`);`,
  `const m = require('${NAME}');`,
  `@import "${NAME}/styles.css";`,
  `@import url("${NAME}/styles.css");`,
  `@import url(${NAME}/styles.css);`,
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (EXT.test(entry.name)) out.push(p);
  }
  return out;
}

describe('@untitledui/icons', () => {
  it('recognises every way to import it', () => {
    for (const form of FORMS) expect(IMPORT.test(form), form).toBe(true);
    expect(IMPORT.test(`import x from '${NAME}-not';`)).toBe(false);
  });

  it('is not a dependency', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as Record<string, Record<string, string> | undefined>;
    for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      expect(Object.keys(pkg[field] ?? {}), field).not.toContain(NAME);
    }
  });

  it('is imported by no source file', () => {
    const files = walk(ROOT).filter((f) => relative(ROOT, f) !== SELF);
    expect(files.length).toBeGreaterThan(300);
    const hits = files.filter((f) => IMPORT.test(readFileSync(f, 'utf8'))).map((f) => relative(ROOT, f));
    expect(hits).toEqual([]);
  });
});
