import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import { exporter } from './ExportService';
import { mkIcon } from '@/test/fixtures';

/**
 * Multi-select export, asserted on the bytes it hands to the browser (A6-gaps G1, G2).
 *
 * The download itself is the DOM's business: `URL.createObjectURL` is stubbed so each
 * export's Blob is captured, and zips are opened with fflate.
 */

const OUTLINE_HOME =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l-2 0l9 -9l9 9l-2 0"/></svg>';
const FILLED_HOME =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.707 2.293l9 9z"/></svg>';
const FLAG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#d0103a" d="M0 0h512v512H0z"/><path fill="#fedf00" d="M0 0h348v512H0z"/></svg>';

const outline = mkIcon({ id: 10, name: 'home', variant: 'outline', svgContent: OUTLINE_HOME });
const filled = mkIcon({ id: 11, name: 'home', variant: 'filled', svgContent: FILLED_HOME });
const flag = mkIcon({ id: 12, name: 'ad', package: 'ichava/icon-sets-flag', variant: '1x1', ownColor: true, svgContent: FLAG });

let blobs: { name: string; blob: Blob }[] = [];

beforeEach(() => {
  blobs = [];
  let pending: Blob | null = null;
  vi.stubGlobal('URL', Object.assign(URL, {
    createObjectURL: vi.fn((b: Blob) => { pending = b; return 'blob:test'; }),
    revokeObjectURL: vi.fn(),
  }));
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    if (pending) blobs.push({ name: this.download, blob: pending });
    pending = null;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function text(b: Blob): Promise<string> {
  return b.text();
}
async function unzip(b: Blob): Promise<Record<string, string>> {
  const files = unzipSync(new Uint8Array(await b.arrayBuffer()));
  return Object.fromEntries(Object.entries(files).map(([k, v]) => [k, strFromU8(v)]));
}
const ids = (sprite: string) => [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]);
const symbol = (sprite: string, id: string) => new RegExp(`<symbol id="${id}"[^>]*>`).exec(sprite)?.[0] ?? '';
const root = (svg: string) => /<svg[^>]*>/.exec(svg)?.[0] ?? '';

describe('ExportService: variants of one icon (G1)', () => {
  it('"SVG files" keeps one file per icon when two variants share a name', async () => {
    await exporter.export('files', [outline, filled]);
    expect(blobs).toHaveLength(1);
    const files = await unzip(blobs[0]!.blob);
    expect(Object.keys(files)).toHaveLength(2);
  });

  it('the ZIP bundle keeps one file per icon under svg/', async () => {
    await exporter.export('zip', [outline, filled]);
    const files = await unzip(blobs[0]!.blob);
    expect(Object.keys(files).filter((f) => f.startsWith('svg/'))).toHaveLength(2);
  });

  it('the sprite gives every icon a unique symbol id', async () => {
    await exporter.export('sprite', [outline, filled, flag]);
    const list = ids(await text(blobs[0]!.blob));
    expect(list).toHaveLength(3);
    expect(new Set(list).size).toBe(3);
  });

  it('a selection without a clash keeps the short pack-name ids it always had', async () => {
    await exporter.export('sprite', [outline, flag]);
    expect(ids(await text(blobs[0]!.blob))).toEqual(['tabler-home', 'flag-ad']);
  });
});

describe('ExportService: the icon keeps its own paint (G2)', () => {
  it('a sprite symbol carries the root fill and stroke, so an outline icon is not filled black', async () => {
    await exporter.export('sprite', [outline, filled]);
    const sprite = await text(blobs[0]!.blob);
    const [o, f] = ids(sprite);
    expect(symbol(sprite, o!)).toContain('fill="none"');
    expect(symbol(sprite, o!)).toContain('stroke="currentColor"');
    expect(symbol(sprite, o!)).toContain('stroke-width="2"');
    expect(symbol(sprite, f!)).toContain('fill="currentColor"');
  });

  it('an exported file keeps the icon root attributes instead of forcing an outline style', async () => {
    await exporter.export('files', [outline, filled, flag]);
    const files = Object.values(await unzip(blobs[0]!.blob));
    const filledFile = files.find((s) => s.includes('M12.707'))!;
    const outlineFile = files.find((s) => s.includes('M5 12l'))!;
    const flagFile = files.find((s) => s.includes('#d0103a'))!;
    expect(root(filledFile)).toContain('fill="currentColor"');
    expect(root(filledFile)).not.toContain('fill="none"');
    expect(root(outlineFile)).toContain('stroke-width="2"');
    expect(root(flagFile)).not.toContain('stroke=');
    expect(root(flagFile)).not.toContain('fill="none"');
  });
});

/**
 * The schema 1.6.0 asset exports through the app's exporter, with the svg module's sanitiser.
 */
describe('asset exports (schema 1.6.0)', () => {
  it('downloads a CSS mask sheet with one class per icon', async () => {
    await exporter.export('css-mask', [outline, flag]);
    expect(blobs.map((b) => b.name)).toEqual(['ichava-icons.css']);
    const css = await text(blobs[0]!.blob);
    expect(css.match(/^\.i-/gm)).toHaveLength(2);
    expect(css).toContain('.i-tabler-home {');
    expect(css).toContain('mask: url("data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22');
  });

  it('downloads a data-URI sheet, and copies one icon as a data URI', async () => {
    await exporter.export('data-uri', [flag]);
    expect(blobs.map((b) => b.name)).toEqual(['ichava-data-uri.css']);
    expect(await text(blobs[0]!.blob)).toContain('--i-flag-ad: url("data:image/svg+xml,');
    const uri = exporter.buildDataUri({ icon: flag, body: '<path fill="#d0103a" d="M0 0h512v512H0z"/>', viewBox: '0 0 512 512', rootAttrs: '' });
    expect(uri).toContain('fill=%22%23d0103a%22');
  });

  it('sanitises what it encodes even when the parts come straight from a caller', () => {
    const css = exporter.buildCssMask([{ icon: outline, body: '<path d="M0 0" onload="alert(1)"/><script>alert(2)</script>', viewBox: '0 0 24 24' }]);
    expect(decodeURIComponent(css)).not.toMatch(/onload|script/);
  });
});
