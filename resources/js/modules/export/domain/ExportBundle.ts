import { strToU8, zipSync } from 'fflate';
import type { Icon } from '@ichava/js-ui-kernel';

/**
 * The registry's asset exports (`x-ichava-formats`, delivery `asset`, schema 1.6.0) that the
 * browser builds itself, from sanitised SVG: a CSS mask sheet and a data-URI sheet (`png-zip`
 * was dropped with schema 1.7.0). formatRegistry.test.ts holds this list, the snippet tabs and the native entries
 * together equal to the registry.
 */
export const ASSET_EXPORT_FORMATS = ['css-mask', 'data-uri'] as const;
export type AssetExportFormat = (typeof ASSET_EXPORT_FORMATS)[number];

/**
 * The registry's native asset formats (`native: true`), both of which ship the original `.svg`
 * files. A browser cannot build an Xcode asset catalogue or a Flutter asset index, so the app points
 * at the generator's downloads instead (`toolbar.nativeExports`) and never offers a file of its own.
 * A third, non-SVG native format was dropped with schema 1.8.0: the ichava icon ecosystem is
 * strictly SVG (svgOnly.test.ts).
 */
export const NATIVE_EXPORT_FORMATS = ['flutter', 'swiftui'] as const;
export type NativeExportFormat = (typeof NATIVE_EXPORT_FORMATS)[number];

/** The four bundle exports that predate the format registry, and the two asset exports. */
export type ExportFormat = 'files' | 'sprite' | 'manifest' | 'zip' | AssetExportFormat;

/**
 * The SVG sanitiser, as a port (the svg module's `sanitizeSvg`, in the app). The asset exports
 * encode markup into CSS, so they refuse to run without one.
 */
export interface ExportSanitizer {
  sanitize(svg: string): string;
}

/** One icon ready to export: its body, viewBox and root paint attributes. */
export interface ExportEntry {
  icon: Icon;
  body: string;
  viewBox: string;
  rootAttrs?: string | undefined;
}

/** One file to hand to the browser. */
export interface ExportFile {
  name: string;
  type: string;
  bytes: Uint8Array;
}

/**
 * How an export names an icon. The catalog owns both rules (`iconRef`, and `packShort`
 * under the slug); they come in as a port so this domain imports no other module.
 */
export interface ExportNaming {
  /** The `pack:name` reference written into the manifest. */
  ref(icon: Icon): string;
  /** The base file name and symbol id, before clashes are resolved. */
  slug(icon: Icon): string;
}

/**
 * An export's bytes, built from entries already read: a sprite, a JSON manifest, one SVG
 * file per icon, or a zip of all three. Pure: no DOM, no fetch, no download. That is
 * `BrowserDownloader`'s job, and reading SVG parts is the caller's.
 *
 * Moved from `core/ExportService.ts`, whose `export()` now builds through this.
 */
export class ExportBundle {
  readonly #naming: ExportNaming;
  readonly #sanitizer: ExportSanitizer | undefined;

  constructor(naming: ExportNaming, sanitizer?: ExportSanitizer) {
    this.#naming = naming;
    this.#sanitizer = sanitizer;
  }

  sprite(entries: ExportEntry[]): string {
    const names = this.names(entries.map((e) => e.icon));
    const symbols = entries
      .map((e, i) => `  <symbol id="${names[i]}" viewBox="${e.viewBox}"${e.rootAttrs ?? ''}>\n    ${e.body}\n  </symbol>`)
      .join('\n');
    return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols}\n</svg>\n`;
  }

  manifest(icons: Icon[]): string {
    return JSON.stringify(
      {
        generated: 'ichava-browser',
        count: icons.length,
        icons: icons.map((i) => ({ id: i.id, ref: this.#naming.ref(i), name: i.name, package: i.package, category: i.category, variant: i.variant })),
      },
      null,
      2,
    );
  }

  /**
   * One icon as a standalone file. The root carries the icon's own paint attributes,
   * read from its source root (`rootAttrs`). This used to force
   * `fill="none" stroke="currentColor" stroke-width="1.5"` on every icon, which made
   * filled icons invisible, outlined flags and emoji, and thinned 2px outlines
   * (A6-gaps G2). An entry without `rootAttrs` (a caller building entries itself) keeps
   * that old default, so its output is unchanged.
   */
  standaloneSvg(e: ExportEntry): string {
    const paint = e.rootAttrs ?? ' fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${e.viewBox}"${paint}>\n  ${e.body}\n</svg>\n`;
  }

  /**
   * One icon's standalone SVG after the sanitiser, as the asset exports encode it. Throws when
   * the bundle has no sanitiser: raw source is never encoded.
   */
  cleanSvg(e: ExportEntry): string {
    if (!this.#sanitizer) throw new Error('ExportBundle: the asset exports need a sanitiser; pass one to the constructor');
    const clean = this.#sanitizer.sanitize(this.standaloneSvg(e)).trim();
    return clean.replace(/^<svg\b(?![^>]*\sxmlns=")/, `<svg xmlns="${SVG_NS}"`);
  }

  /** One icon as a percent-encoded `data:image/svg+xml,…` URI ("Copy as data URI"). */
  dataUri(e: ExportEntry): string {
    return encodeSvgDataUri(this.cleanSvg(e));
  }

  /**
   * A CSS mask sheet: one `.i-<name>` class per icon that paints it in `currentColor`, as
   * unplugin-icons and @iconify/tailwind do. A mask keeps only the shape, so a flag or emoji
   * paints in one colour; the data-URI sheet keeps their colours.
   */
  cssMask(entries: ExportEntry[]): string {
    const names = this.names(entries.map((e) => e.icon));
    const rules = entries.map((e, i) => {
      const url = `url("${this.dataUri(e)}") no-repeat center / contain`;
      return (
        `.i-${cssIdent(names[i]!)} {\n  display: inline-block;\n  width: 1em;\n  height: 1em;\n  background-color: currentColor;\n` +
        `  -webkit-mask: ${url};\n  mask: ${url};\n}\n`
      );
    });
    return `/* Ichava icons as CSS masks: each class paints its icon in currentColor. Built by ichava-browser from sanitised SVG. */\n${rules.join('')}`;
  }

  /** A data-URI sheet: one `--i-<name>` custom property per icon, colours kept. */
  dataUriCss(entries: ExportEntry[]): string {
    const names = this.names(entries.map((e) => e.icon));
    const props = entries.map((e, i) => `  --i-${cssIdent(names[i]!)}: url("${this.dataUri(e)}");\n`).join('');
    return `/* Ichava icons as data URIs. Built by ichava-browser from sanitised SVG. */\n:root {\n${props}}\n`;
  }

  /**
   * The file names / symbol ids for one export, in order.
   *
   * `pack-name` as before, so an export with no clash is byte-identical to what it always
   * produced. Variants of one icon share that name (tabler `home` outline and filled), and
   * the zip kept only the last while the sprite repeated the id (A6-gaps G1), so a clash
   * takes the variant, and a clash that survives that takes the numeric id.
   */
  names(icons: Icon[]): string[] {
    const count = (keys: string[]) => keys.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map<string, number>());
    const base = icons.map((icon) => this.#naming.slug(icon));
    const baseCount = count(base);
    const withVariant = icons.map((icon, i) => (baseCount.get(base[i]!)! > 1 ? `${base[i]}-${icon.variant}` : base[i]!));
    const variantCount = count(withVariant);
    return icons.map((icon, i) => (variantCount.get(withVariant[i]!)! > 1 ? `${withVariant[i]}-${icon.id}` : withVariant[i]!));
  }

  /**
   * The one file an export of `entries` downloads. `manifest` reads only the icons, so
   * its entries need no body. Throws on an empty export: there is nothing to download.
   */
  build(format: ExportFormat, entries: ExportEntry[]): ExportFile {
    if (!entries.length) throw new RangeError('ExportBundle.build: nothing to export');
    const icons = entries.map((e) => e.icon);
    if (format === 'manifest') return text('ichava-manifest.json', this.manifest(icons), 'application/json');
    if (format === 'sprite') return text('ichava-sprite.svg', this.sprite(entries), 'image/svg+xml');
    if (format === 'css-mask') return text('ichava-icons.css', this.cssMask(entries), 'text/css');
    if (format === 'data-uri') return text('ichava-data-uri.css', this.dataUriCss(entries), 'text/css');
    const names = this.names(icons);
    if (format === 'files') {
      // "Individual .svg downloads" — one .svg per icon, bundled in a zip (browsers
      // block many simultaneous downloads; a single icon downloads the raw .svg).
      if (entries.length === 1) return text(`${names[0]}.svg`, this.standaloneSvg(entries[0]!), 'image/svg+xml');
      const svgs: Record<string, Uint8Array> = {};
      entries.forEach((e, i) => { svgs[`${names[i]}.svg`] = strToU8(this.standaloneSvg(e)); });
      return { name: 'ichava-svgs.zip', type: 'application/zip', bytes: zipSync(svgs, { level: 6 }) };
    }
    // zip: sprite + manifest + per-icon svgs
    const files: Record<string, Uint8Array> = {
      'sprite.svg': strToU8(this.sprite(entries)),
      'manifest.json': strToU8(this.manifest(icons)),
    };
    entries.forEach((e, i) => { files[`svg/${names[i]}.svg`] = strToU8(this.standaloneSvg(e)); });
    return { name: 'ichava-icons.zip', type: 'application/zip', bytes: zipSync(files, { level: 6 }) };
  }
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Characters a data URI keeps as written. Everything else, `"`, `\\`, `#`, `%`, `<`, `>` and whitespace included, is percent-encoded. */
const URI_SAFE = /^[A-Za-z0-9\-_.~!*'()/:;=,?@&+$]$/;

/**
 * `svg` as a `data:image/svg+xml,…` URI, percent-encoded rather than base64 (smaller, and the
 * same approach as mini-svg-data-uri). Runs of whitespace collapse to one space. Nothing that
 * could close a quoted CSS `url("…")` survives: quotes, backslashes and newlines are all
 * encoded. Encode only sanitised SVG.
 */
export function encodeSvgDataUri(svg: string): string {
  let out = '';
  for (const ch of svg.replace(/\s+/g, ' ').trim()) out += URI_SAFE.test(ch) ? ch : encodeURIComponent(ch);
  return `data:image/svg+xml,${out}`;
}

/** A name as a CSS identifier fragment: anything but letters, digits, `-` and `_` becomes `-`. */
function cssIdent(name: string): string {
  return name.replace(/[^A-Za-z0-9_-]+/g, '-');
}

function text(name: string, content: string, type: string): ExportFile {
  return { name, type, bytes: strToU8(content) };
}
