import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { strFromU8, unzipSync } from 'fflate';
import { mkIcon } from '@/test/fixtures';
import { sanitizeSvg } from '@/modules/svg';
import { ExportBundle, ASSET_EXPORT_FORMATS, NATIVE_EXPORT_FORMATS, type ExportEntry, type ExportFormat } from '@/modules/export';
import { FORMATS } from '@/core/api/schema.gen';

/**
 * The ichava icon ecosystem is strictly SVG (owner rule, 2026-11-04). The browser offers no raster
 * download (the detail dialog's PNG option and core/raster.ts were removed) and no non-SVG vector
 * format (android-vd left the registry with schema 1.8.0). These guards fail if either comes back:
 * every download the browser can produce is SVG, or CSS/JSON that carries SVG, or a zip of those.
 */
const SRC = join(__dirname, '..');
const DIALOG = join(SRC, 'components', 'browser', 'IconDetailDialog.tsx');

/** Every non-test source file under src/, counted so a glob that matches nothing cannot pass. */
function sourceFiles(dir: string = SRC): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'test' ? [] : sourceFiles(path);
    if (!/\.(ts|tsx|json)$/.test(name) || /\.test\.tsx?$/.test(name)) return [];
    // Generated from the schema, whose format description records the ids it removed; the
    // registry assertion below checks the generated FORMATS list itself.
    if (name === 'schema.gen.ts') return [];
    return [path];
  });
}

/** Anything that renders, names or writes a raster or non-SVG vector output. */
const NON_SVG = /svgToPng|image\/(png|jpe?g|webp|gif|avif|bmp)|\.toBlob\(|\.toDataURL\(|\.(png|jpe?g|webp|gif)['"`]|android-vd|VectorDrawable/;

/** The file types a browser download may carry: SVG, or text/zip that holds SVG. */
const SVG_TYPES = ['image/svg+xml', 'text/css', 'application/json', 'application/zip'];

describe('the browser is SVG only', () => {
  it('names no raster renderer, raster MIME type or non-SVG vector format in src/', () => {
    const files = sourceFiles();
    expect(files.length).toBeGreaterThan(150);
    const hits = files.flatMap((f) =>
      readFileSync(f, 'utf8').split('\n').flatMap((line, i) => (NON_SVG.test(line) ? [`${relative(SRC, f)}:${i + 1}: ${line.trim()}`] : [])),
    );
    expect(hits).toEqual([]);
  });

  it("offers only SVG-based entries in the detail dialog's Download menu", () => {
    const src = readFileSync(DIALOG, 'utf8');
    const menu = src.slice(src.indexOf("label={t('detail.download')}"));
    const items = menu.slice(menu.indexOf('items={['), menu.indexOf(']}'));
    const ids = [...items.matchAll(/\{ id: '([\w-]+)'/g)].map((m) => m[1]);
    expect(ids).toEqual(['svg', 'css-mask', 'data-uri']);
    const types = src.split('\n').filter((l) => l.includes('new Blob(')).map((l) => /\{ type: '([^']+)' \}/.exec(l)?.[1]);
    expect(types.length).toBeGreaterThanOrEqual(2);
    for (const type of types) expect(SVG_TYPES).toContain(type);
  });

  it('lists only SVG-carrying asset exports in the registry and the export module', () => {
    expect(FORMATS.filter((f) => f.delivery === 'asset').map((f) => f.id)).toEqual(['css-mask', 'data-uri', 'flutter', 'swiftui']);
    expect([...ASSET_EXPORT_FORMATS, ...NATIVE_EXPORT_FORMATS]).toEqual(['css-mask', 'data-uri', 'flutter', 'swiftui']);
    for (const f of FORMATS) expect(f.id).not.toMatch(NON_SVG);
  });

  it('builds every export as SVG, CSS, JSON or a zip of SVG and JSON', () => {
    const bundle = new ExportBundle({ ref: (i) => `ref:${i.name}`, slug: (i) => `t-${i.name}` }, { sanitize: sanitizeSvg });
    const entries: ExportEntry[] = [
      { icon: mkIcon({ id: 1, name: 'home' }), body: '<path d="M3 12h18"/>', viewBox: '0 0 24 24' },
      { icon: mkIcon({ id: 2, name: 'bell' }), body: '<circle cx="12" cy="12" r="4"/>', viewBox: '0 0 24 24' },
    ];
    const formats: ExportFormat[] = ['files', 'sprite', 'manifest', 'zip', ...ASSET_EXPORT_FORMATS];
    for (const format of formats) {
      for (const set of [entries, entries.slice(0, 1)]) {
        const file = bundle.build(format, set);
        expect(SVG_TYPES).toContain(file.type);
        expect(file.name).toMatch(/\.(svg|css|json|zip)$/);
        if (file.type === 'application/zip') {
          const inner = Object.keys(unzipSync(file.bytes as Uint8Array));
          expect(inner.length).toBeGreaterThan(0);
          for (const name of inner) expect(name).toMatch(/\.(svg|json)$/);
        } else if (file.type === 'image/svg+xml') {
          expect(strFromU8(file.bytes as Uint8Array)).toMatch(/^<svg[\s>]/);
        }
      }
    }
  });
});
