import { describe, expect, it } from 'vitest';
import { strFromU8 } from 'fflate';
import { mkIcon } from '@/test/fixtures';
import { sanitizeSvg } from '@/modules/svg';
import { ExportBundle, ASSET_EXPORT_FORMATS, encodeSvgDataUri, type ExportEntry } from './ExportBundle';

/**
 * The schema 1.6.0 asset exports (scope V-B15, V-B16): a CSS mask sheet and a data-URI sheet,
 * both built from sanitised SVG (the PNG zip was dropped with schema 1.7.0). The sanitiser is the real one, passed in as the
 * port the app passes, so these tests also prove every asset path goes through it.
 */
const naming = { ref: (i: { name: string }) => `ref:${i.name}`, slug: (i: { name: string }) => `t-${i.name}` };
const bundle = new ExportBundle(naming, { sanitize: sanitizeSvg });

const entry = (id: number, name: string, body: string, rootAttrs = ' fill="none" stroke="currentColor"'): ExportEntry => ({
  icon: mkIcon({ id, name }),
  body,
  viewBox: '0 0 24 24',
  rootAttrs,
});
const home = entry(1, 'home', '<path d="M3 12h18"/>');
const bell = entry(2, 'bell', '<circle cx="12" cy="12" r="4"/>');
const flag = entry(3, 'ke', '<rect width="24" height="8" fill="#006600"/>', '');

const uri = (svg: string) => encodeSvgDataUri(svg);
const HOME = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%3E%20%3Cpath%20d=%22M3%2012h18%22%3E%3C/path%3E%20%3C/svg%3E';

describe('the data URI encoding', () => {
  it('percent-encodes, keeps the safe characters readable and is not base64', () => {
    expect(uri('<svg xmlns="http://www.w3.org/2000/svg"><path d="M1 0"/></svg>')).toBe(
      'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d=%22M1%200%22/%3E%3C/svg%3E',
    );
    expect(uri('<svg/>')).not.toContain('base64');
  });

  it('cannot break out of url("…"): quotes, backslashes, newlines and url(#id) are escaped', () => {
    const hostile = '<svg>\n<path fill="url(#a)" d="M0 0"/>"); background: url(http://evil.test/x) \\ </svg>';
    const out = uri(hostile);
    expect(out).not.toMatch(/["\\\n\r<>#%](?![0-9A-F]{2})/);
    expect(out).not.toContain('"');
    expect(out).toContain('url(%23a)');
    // The value sits inside one quoted CSS string: the string ends only at the quote we add.
    const css = `a { mask: url("${out}") }`;
    expect(css.indexOf('"', css.indexOf('url("') + 5)).toBe(css.length - 4);
  });

  it('encodes non-ASCII as UTF-8 bytes', () => {
    expect(uri('<text>é</text>')).toContain('%C3%A9');
  });
});

describe('the CSS mask export', () => {
  it('writes one class per icon, painted in currentColor (golden)', () => {
    const f = bundle.build('css-mask', [home, bell, flag]);
    expect(f).toMatchObject({ name: 'ichava-icons.css', type: 'text/css' });
    const css = strFromU8(f.bytes);
    const rule = (cls: string, data: string) =>
      `.i-${cls} {\n  display: inline-block;\n  width: 1em;\n  height: 1em;\n  background-color: currentColor;\n  -webkit-mask: url("${data}") no-repeat center / contain;\n  mask: url("${data}") no-repeat center / contain;\n}\n`;
    expect(css).toBe(
      '/* Ichava icons as CSS masks: each class paints its icon in currentColor. Built by ichava-browser from sanitised SVG. */\n' +
        rule('t-home', HOME) +
        rule('t-bell', bundle.dataUri(bell)) +
        rule('t-ke', bundle.dataUri(flag)),
    );
  });

  it('turns a name that is not a CSS identifier into one', () => {
    const odd = entry(4, 'a b.c', '<path d="M0 0"/>');
    expect(strFromU8(bundle.build('css-mask', [odd]).bytes)).toContain('.i-t-a-b-c {');
  });
});

describe('the data URI export', () => {
  it('writes one custom property per icon (golden)', () => {
    const f = bundle.build('data-uri', [home, bell]);
    expect(f).toMatchObject({ name: 'ichava-data-uri.css', type: 'text/css' });
    expect(strFromU8(f.bytes)).toBe(
      '/* Ichava icons as data URIs. Built by ichava-browser from sanitised SVG. */\n' +
        `:root {\n  --i-t-home: url("${HOME}");\n  --i-t-bell: url("${bundle.dataUri(bell)}");\n}\n`,
    );
  });

  it('copies one icon as a data URI', () => {
    expect(bundle.dataUri(home)).toBe(HOME);
  });
});

describe('the sanitiser on every asset path', () => {
  const hostile = entry(9, 'evil', '<script>alert(1)</script><path d="M0 0" onclick="alert(2)"/><foreignObject><img src=x onerror=alert(3)></foreignObject>');

  it('strips script, handlers and foreign content before anything is encoded', () => {
    for (const text of [bundle.dataUri(hostile), strFromU8(bundle.build('css-mask', [hostile]).bytes), strFromU8(bundle.build('data-uri', [hostile]).bytes)]) {
      expect(text.toLowerCase()).not.toMatch(/script|onclick|onerror|foreignobject/);
    }
  });

  it('refuses the asset exports when no sanitiser was given, rather than encode raw markup', () => {
    const raw = new ExportBundle(naming);
    expect(() => raw.dataUri(home)).toThrow(/sanitiser/);
    expect(() => raw.build('css-mask', [home])).toThrow(/sanitiser/);
    expect(() => raw.build('data-uri', [home])).toThrow(/sanitiser/);
    // The four older exports are unchanged without one.
    expect(() => raw.build('sprite', [home])).not.toThrow();
  });
});

describe('the bundle exports', () => {
  it('has no png-zip: dropped with schema 1.7.0', () => {
    expect([...ASSET_EXPORT_FORMATS]).toEqual(['css-mask', 'data-uri']);
  });

  it('keeps the manifest of an export unchanged', () => {
    expect(strFromU8(bundle.build('manifest', [home]).bytes)).toContain('"ref": "ref:home"');
  });
});
