import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Untitled UI React PRO source is licensed, not free: every PRO folder is listed in
 * LICENSE, and every file in one opens with the licence comment. Both halves are checked,
 * so a PRO file copied into a folder LICENSE does not name, or a folder listed with a file
 * missing its header, fails here rather than being found later by a reader.
 */

// The repository root. The source sits in resources/js since react consolidation 3d (2026-11-12).
const root = join(__dirname, '..', '..', '..');
const HEADER = '// Untitled UI React PRO, used under licence; see LICENSE';

function proFolders(): string[] {
  const text = readFileSync(join(root, 'LICENSE'), 'utf8');
  const section = text.slice(text.indexOf('Untitled UI PRO'), text.indexOf('Third-party components'));
  return [...section.matchAll(/^- (resources\/js\/\S+)$/gm)].map((m) => m[1]!);
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|css)$/.test(n) ? [p] : [];
  });
}

describe('Untitled UI PRO licence notices', () => {
  const folders = proFolders();

  it('LICENSE lists at least one PRO folder', () => {
    expect(folders.length).toBeGreaterThan(0);
  });

  it.each(folders)('every file under %s opens with the licence comment', (folder) => {
    const list = files(join(root, folder));
    expect(list.length, `${folder} is listed in LICENSE but holds no source`).toBeGreaterThan(0);
    for (const f of list) expect(readFileSync(f, 'utf8').startsWith(HEADER), f).toBe(true);
  });

  it('no file outside the listed folders carries the PRO header', () => {
    const stray = files(join(root, 'resources/js')).filter(
      (f) => readFileSync(f, 'utf8').startsWith(HEADER) && !folders.some((d) => f.startsWith(join(root, d))),
    );
    expect(stray).toEqual([]);
  });
});
