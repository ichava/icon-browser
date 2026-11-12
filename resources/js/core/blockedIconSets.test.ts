import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BLOCKED_PACKAGES, blockedReason } from '../../scripts/blocked-icon-sets.mjs';

/**
 * The fixture generator excludes a blocked pack whole (`scripts/blocked-icon-sets.mjs`):
 * no sample, no asset, no `packages` entry, no share of `total_ecosystem`.
 *
 * It runs the real `scripts/generate-fixture.mjs` over a synthetic workspace holding a
 * Metronic pack and a bundled pack (with a stale bundled asset left by an earlier run)
 * beside an allowed tabler pack and flag pack, then reads what it wrote. The allowed packs
 * are the positive control: a generator that wrote nothing would otherwise pass every
 * "is absent" assertion. Removing the skip in the generator turns this file red (checked
 * when it was changed).
 */

const GENERATOR = join(__dirname, '..', '..', 'scripts', 'generate-fixture.mjs');
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';
const METRONIC = 'ichava/icon-sets-metronic';
const BUNDLED = 'ichava/icon-sets-bundled';
const BLOCKED = [
  { dir: 'icon-sets-metronic', id: METRONIC, files: ['flags/kenya.svg', 'brand-logos/acme.svg', 'illustrations/1.svg'] },
  { dir: 'icon-sets-bundled', id: BUNDLED, files: ['feather-icons/a.svg', 'mdi/b.svg', 'icomoon/c.svg', 'fontawesome/solid/d.svg'] },
];
const ALLOWED_FILES = { tabler: 2, flag: 3 };

interface Out {
  meta: { total_ecosystem: number };
  packages: { id: string; count: number }[];
  icons: { package: string; category: string; name: string; svgUrl: string }[];
}

let root: string;
let out: Out;

function pack(dir: string, name: string, files: string[], variants: Record<string, { default?: boolean }> = {}) {
  const svgRoot = join(root, 'ws', dir, 'resources', 'assets', 'svg');
  mkdirSync(svgRoot, { recursive: true });
  writeFileSync(join(svgRoot, 'config.json'), JSON.stringify({ package: { name }, metadata: { data: { variants, categories: {} } } }));
  for (const f of files) {
    const p = join(svgRoot, 'files', f);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, SVG);
  }
}

function listSvgs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.svg'));
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'ichava-fixture-'));
  for (const b of BLOCKED) pack(b.dir, b.id, b.files);
  pack('icon-sets-tabler', 'ichava/icon-sets-tabler', ['outline/home.svg', 'filled/home.svg'], { outline: { default: true }, filled: {} });
  pack('icon-sets-flag', 'ichava/icon-sets-flag', ['4x3/ke.svg', '4x3/tz.svg', '1x1/ke.svg']);
  // A stale asset from a run before the pack was blocked: the generator must clear it.
  const stale = join(root, 'public', 'assets', 'icon-sets-bundled', 'mdi');
  mkdirSync(stale, { recursive: true });
  writeFileSync(join(stale, 'old.svg'), SVG);
  execFileSync(process.execPath, [GENERATOR, '--workspace', join(root, 'ws'), '--public', join(root, 'public'), '--per-pack', '100', '--date', '2026-01-01'], {
    stdio: 'pipe',
  });
  out = JSON.parse(readFileSync(join(root, 'public', 'data', 'icons.json'), 'utf8')) as Out;
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe('the fixture generator excludes blocked packs whole', () => {
  it('blocks exactly the packs react-landingpage#40 keeps off the page', () => {
    expect(Object.keys(BLOCKED_PACKAGES).sort()).toEqual([BUNDLED, METRONIC]);
    expect(blockedReason(METRONIC)).toBeTruthy();
    expect(blockedReason(BUNDLED)).toBeTruthy();
    expect(blockedReason('ichava/icon-sets-tabler')).toBeUndefined();
  });

  it('still samples, lists and counts the allowed packs (positive control)', () => {
    expect(out.icons.filter((i) => i.package === 'ichava/icon-sets-tabler')).toHaveLength(ALLOWED_FILES.tabler);
    expect(out.icons.filter((i) => i.package === 'ichava/icon-sets-flag')).toHaveLength(ALLOWED_FILES.flag);
    expect(out.packages.map((p) => p.id).sort()).toEqual(['ichava/icon-sets-flag', 'ichava/icon-sets-tabler']);
    expect(listSvgs(join(root, 'public', 'assets', 'icon-sets-flag'))).toHaveLength(ALLOWED_FILES.flag);
  });

  it.each(BLOCKED.map((b) => [b.id, b]))('samples, lists and ships nothing from %s', (_id, b) => {
    expect(out.icons.filter((i) => i.package === b.id)).toEqual([]);
    expect(out.packages.find((p) => p.id === b.id)).toBeUndefined();
    expect(listSvgs(join(root, 'public', 'assets', b.dir))).toEqual([]);
  });

  it('does not count blocked packs in the total, which is the sum of the listed packs', () => {
    expect(out.meta.total_ecosystem).toBe(ALLOWED_FILES.tabler + ALLOWED_FILES.flag);
    expect(out.meta.total_ecosystem).toBe(out.packages.reduce((n, p) => n + p.count, 0));
  });
});
