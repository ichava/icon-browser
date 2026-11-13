import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

/**
 * Every deprecated symbol was removed before 0.1.0 (owner's decision, 2026-10-30). This keeps
 * a new `@deprecated` from settling in unnoticed: deprecate and remove in the same release
 * cycle, or keep the thing as supported. CHANGELOG history is not scanned.
 *
 * The ten kernel re-exports deprecated in react consolidation 3d were removed on 2026-11-13
 * (owner: "wire in what can be wired, otherwise remove"); their importers now import
 * @ichava/js-ui-kernel/react directly.
 */
const ROOT = resolve(process.cwd(), 'resources/js');

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(tsx?|css)$/.test(name) && !path.endsWith('noDeprecations.test.ts') ? [path] : [];
  });
}

describe('no deprecated symbols', () => {
  it('keeps the sources free of @deprecated markers', () => {
    const files = sources(ROOT);

    // A walk that found nothing would pass; pin the size of what was inspected.
    expect(files.length).toBeGreaterThan(127);

    const offenders = files
      .filter((f) => readFileSync(f, 'utf8').includes('@deprecated'))
      .map((f) => relative(ROOT, f).split(sep).join('/'))
      .sort();
    expect(offenders).toEqual([]);
  });

  it('names the motion engine by its package in generated snippets', () => {
    const factory = readFileSync(join(ROOT, 'modules/snippets/infrastructure/SnippetFactory.ts'), 'utf8');

    expect(factory).not.toContain('ichava-motion.js');
  });
});
