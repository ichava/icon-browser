import type { Icon } from '@ichava/js-ui-kernel';
/**
 * The registry's asset exports (`x-ichava-formats`, delivery `asset`, schema 1.6.0) that the
 * browser builds itself, from sanitised SVG: a CSS mask sheet and a data-URI sheet (`png-zip`
 * was dropped with schema 1.7.0). formatRegistry.test.ts holds this list, the snippet tabs and the native entries
 * together equal to the registry.
 */
export declare const ASSET_EXPORT_FORMATS: readonly ['css-mask', 'data-uri'];
export type AssetExportFormat = (typeof ASSET_EXPORT_FORMATS)[number];
/**
 * The registry's native asset formats (`native: true`), both of which ship the original `.svg`
 * files. A browser cannot build an Xcode asset catalogue or a Flutter asset index, so the app points
 * at the generator's downloads instead (`toolbar.nativeExports`) and never offers a file of its own.
 * A third, non-SVG native format was dropped with schema 1.8.0: the ichava icon ecosystem is
 * strictly SVG (svgOnly.test.ts).
 */
export declare const NATIVE_EXPORT_FORMATS: readonly ['flutter', 'swiftui'];
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
export declare class ExportBundle {
    #private;
    constructor(naming: ExportNaming, sanitizer?: ExportSanitizer);
    sprite(entries: ExportEntry[]): string;
    manifest(icons: Icon[]): string;
    /**
     * One icon as a standalone file. The root carries the icon's own paint attributes,
     * read from its source root (`rootAttrs`). This used to force
     * `fill="none" stroke="currentColor" stroke-width="1.5"` on every icon, which made
     * filled icons invisible, outlined flags and emoji, and thinned 2px outlines
     * (A6-gaps G2). An entry without `rootAttrs` (a caller building entries itself) keeps
     * that old default, so its output is unchanged.
     */
    standaloneSvg(e: ExportEntry): string;
    /**
     * One icon's standalone SVG after the sanitiser, as the asset exports encode it. Throws when
     * the bundle has no sanitiser: raw source is never encoded.
     */
    cleanSvg(e: ExportEntry): string;
    /** One icon as a percent-encoded `data:image/svg+xml,…` URI ("Copy as data URI"). */
    dataUri(e: ExportEntry): string;
    /**
     * A CSS mask sheet: one `.i-<name>` class per icon that paints it in `currentColor`, as
     * unplugin-icons and @iconify/tailwind do. A mask keeps only the shape, so a flag or emoji
     * paints in one colour; the data-URI sheet keeps their colours.
     */
    cssMask(entries: ExportEntry[]): string;
    /** A data-URI sheet: one `--i-<name>` custom property per icon, colours kept. */
    dataUriCss(entries: ExportEntry[]): string;
    /**
     * The file names / symbol ids for one export, in order.
     *
     * `pack-name` as before, so an export with no clash is byte-identical to what it always
     * produced. Variants of one icon share that name (tabler `home` outline and filled), and
     * the zip kept only the last while the sprite repeated the id (A6-gaps G1), so a clash
     * takes the variant, and a clash that survives that takes the numeric id.
     */
    names(icons: Icon[]): string[];
    /**
     * The one file an export of `entries` downloads. `manifest` reads only the icons, so
     * its entries need no body. Throws on an empty export: there is nothing to download.
     */
    build(format: ExportFormat, entries: ExportEntry[]): ExportFile;
}
/**
 * `svg` as a `data:image/svg+xml,…` URI, percent-encoded rather than base64 (smaller, and the
 * same approach as mini-svg-data-uri). Runs of whitespace collapse to one space. Nothing that
 * could close a quoted CSS `url("…")` survives: quotes, backslashes and newlines are all
 * encoded. Encode only sanitised SVG.
 */
export declare function encodeSvgDataUri(svg: string): string;
