import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

/**
 * Every deprecated symbol was removed before 0.1.0 (owner's decision, 2026-10-30). This keeps
 * a new `@deprecated` from settling in unnoticed: deprecate and remove in the same release
 * cycle, or keep the thing as supported. CHANGELOG history is not scanned.
 *
 * One exception, and it is a ceiling: the ten files whose code moved to
 * @ichava/js-ui-kernel/react in react consolidation 3d (2026-11-12). The owner's rule is that
 * nothing is removed without a per-item yes, so each stays as a deprecated re-export, recorded
 * in react-consolidation audits/deprecations.md. The list must match exactly: a new
 * `@deprecated` fails, and so does an entry whose file stopped being one.
 */
const KERNEL_RE_EXPORTS = [
  'components/base/avatar/base-components/avatar-count.tsx',
  'components/base/avatar/base-components/avatar-online-indicator.tsx',
  'components/base/avatar/base-components/index.tsx',
  'components/base/avatar/base-components/verified-tick.tsx',
  'components/base/radio-buttons/radio-buttons.tsx',
  'components/base/toggle/toggle.tsx',
  'components/foundations/featured-icon/featured-icon.tsx',
  'lib/utils/cx.ts',
  'lib/utils/is-react-component.ts',
  'styles/uui-theme.css',
];
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
    expect(offenders).toEqual(KERNEL_RE_EXPORTS);
  });

  it('names the motion engine by its package in generated snippets', () => {
    const factory = readFileSync(join(ROOT, 'modules/snippets/infrastructure/SnippetFactory.ts'), 'utf8');

    expect(factory).not.toContain('ichava-motion.js');
  });
});
