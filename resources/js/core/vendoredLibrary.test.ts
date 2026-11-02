import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

/**
 * The vendored @ichava/react-icon-browser build is exactly what its manifest says.
 *
 * `.dev/tools/sync-react-icon-browser.mjs` copies the library's `dist/lib` here and writes
 * `VENDORED.json`: the commit it was built from and a hash of every file. A hand edit to the
 * bundle, a partial copy, or a stray file would otherwise ship unnoticed, since nothing else
 * reads these files until a host's page renders them. Re-run the sync script; never edit
 * the vendored files.
 */
const dir = resolve(process.cwd(), 'resources/vendor/react-icon-browser');
const manifest = JSON.parse(readFileSync(join(dir, 'VENDORED.json'), 'utf8')) as {
  package: string;
  commit: string;
  files: Record<string, string>;
};

const walk = (d: string): string[] =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));

const onDisk = walk(dir)
  .map((f) => relative(dir, f).split(sep).join('/'))
  .filter((f) => f !== 'VENDORED.json')
  .sort();

describe('vendored react-icon-browser', () => {
  it('names the package and the full commit it was built from', () => {
    expect(manifest.package).toBe('@ichava/react-icon-browser');
    expect(manifest.commit).toMatch(/^[0-9a-f]{40}$/);
  });

  it('holds exactly the files its manifest lists', () => {
    // Floor: the bundle, the stylesheet, two fonts and the declarations. A walk that finds
    // nothing must fail rather than agree with an empty manifest.
    expect(onDisk.length).toBeGreaterThan(100);
    expect(onDisk).toEqual(Object.keys(manifest.files).sort());
  });

  it('matches every hash in the manifest', () => {
    const drift = onDisk.filter((f) => createHash('sha256').update(readFileSync(join(dir, f))).digest('hex') !== manifest.files[f]);
    expect(drift).toEqual([]);
  });

  it('ships no source map, whose sources are the readable library source', () => {
    expect(onDisk.filter((f) => f.endsWith('.map'))).toEqual([]);
    expect(existsSync(join(dir, 'index.js.map'))).toBe(false);
  });

  it('carries the library licence', () => {
    expect(readFileSync(join(dir, 'LICENSE'), 'utf8')).toContain('Untitled UI PRO');
  });

  it('does not say the repository it ships in must stay private', () => {
    // react-icon-browser's own LICENSE says its repository must remain private, which is
    // true there and false here: ichava/icon-browser is public and carries only the compiled
    // build. A re-sync copies that LICENSE back verbatim, so this fails until it is reworded.
    const license = readFileSync(join(dir, 'LICENSE'), 'utf8').replace(/\s+/g, ' ');
    expect(license).not.toMatch(/must (therefore )?remain private/i);
    expect(license).toContain('may not be redistributed outside them');
  });
});
