import type { Icon } from '@ichava/js-ui-kernel';
export type ExportFormat = 'files' | 'sprite' | 'manifest' | 'zip';
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
    constructor(naming: ExportNaming);
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
