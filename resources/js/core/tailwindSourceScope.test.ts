import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Vitest runs from the package root (vitest.config.ts), so paths resolve from process.cwd().

/**
 * Tailwind's source scan skips what this package's .gitignore skips, and nothing else.
 *
 * `.claude/` was ignored only by a global git excludes file, which the scanner does not
 * read. It therefore read every agent worktree under `.claude/worktrees/` (older branches of
 * this package, each with its own `resources/js`), and a local `npm run build:prod` committed
 * about 108 rules no current source uses: 228,376 bytes of CSS against 162,316 with the line
 * below. The failure is silent and pixel-affecting, since a rule a stale branch used can
 * start applying to markup here.
 */
const gitignore = readFileSync(resolve(process.cwd(), '.gitignore'), 'utf8')
  .split('\n')
  .map((line) => line.trim());

describe('Tailwind source scope', () => {
  it('ignores .claude/ in this package, not only in a global excludes file', () => {
    expect(gitignore).toContain('/.claude/');
  });
});
