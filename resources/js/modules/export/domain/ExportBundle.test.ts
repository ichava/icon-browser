import { describe, expect, it } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import { mkIcon } from '@/test/fixtures';
import { ExportBundle, type ExportEntry } from './ExportBundle';

/**
 * The bundle on its own, on bytes: no DOM, no download, no fetch. A naming port stands
 * in for the catalog, so these tests also prove the domain takes its names from it.
 */
const bundle = new ExportBundle({ ref: (i) => `ref:${i.name}`, slug: (i) => `s-${i.name}` });

const entry = (id: number, name: string, variant: string, rootAttrs = ' fill="none"'): ExportEntry => ({
  icon: mkIcon({ id, name, variant }),
  body: `<path d="M${id} 0"/>`,
  viewBox: '0 0 24 24',
  rootAttrs,
});
const a = entry(1, 'home', 'outline');
const b = entry(2, 'home', 'filled', ' fill="currentColor"');
const c = entry(3, 'home', 'filled');
const d = entry(4, 'bell', 'outline');

describe('ExportBundle', () => {
  it('names with the port slug, then the variant, then the id on a clash', () => {
    expect(bundle.names([a, b, c, d].map((e) => e.icon))).toEqual(['s-home-outline', 's-home-filled-2', 's-home-filled-3', 's-bell']);
    expect(bundle.names([d.icon])).toEqual(['s-bell']);
  });

  it('builds a manifest with the port ref and no SVG bodies', () => {
    const f = bundle.build('manifest', [a, d]);
    expect(f).toMatchObject({ name: 'ichava-manifest.json', type: 'application/json' });
    const m = JSON.parse(strFromU8(f.bytes));
    expect(m).toMatchObject({ generated: 'ichava-browser', count: 2 });
    expect(m.icons.map((i: { ref: string }) => i.ref)).toEqual(['ref:home', 'ref:bell']);
  });

  it('builds a sprite whose symbols keep each icon\'s root paint', () => {
    const svg = strFromU8(bundle.build('sprite', [a, b]).bytes);
    expect(svg).toContain('<symbol id="s-home-outline" viewBox="0 0 24 24" fill="none">');
    expect(svg).toContain('<symbol id="s-home-filled" viewBox="0 0 24 24" fill="currentColor">');
  });

  it('downloads one icon as a bare .svg and several as a zip of files', () => {
    const one = bundle.build('files', [d]);
    expect(one).toMatchObject({ name: 's-bell.svg', type: 'image/svg+xml' });
    expect(strFromU8(one.bytes)).toBe('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">\n  <path d="M4 0"/>\n</svg>\n');
    const many = bundle.build('files', [a, b, d]);
    expect(many).toMatchObject({ name: 'ichava-svgs.zip', type: 'application/zip' });
    expect(Object.keys(unzipSync(many.bytes)).sort()).toEqual(['s-bell.svg', 's-home-filled.svg', 's-home-outline.svg']);
  });

  it('zips the sprite, the manifest and every file', () => {
    const z = unzipSync(bundle.build('zip', [a, b]).bytes);
    expect(Object.keys(z).sort()).toEqual(['manifest.json', 'sprite.svg', 'svg/s-home-filled.svg', 'svg/s-home-outline.svg']);
    expect(strFromU8(z['svg/s-home-filled.svg']!)).toContain('fill="currentColor"');
  });

  it('keeps the old default paint for an entry without rootAttrs', () => {
    const { rootAttrs: _drop, ...bare } = d;
    expect(bundle.standaloneSvg(bare)).toContain('fill="none" stroke="currentColor" stroke-width="1.5"');
  });

  it('refuses an empty export', () => {
    expect(() => bundle.build('zip', [])).toThrow(RangeError);
  });
});
