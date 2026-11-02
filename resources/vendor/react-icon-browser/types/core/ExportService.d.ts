import { type ExportEntry, type ExportFormat } from '../modules/export';
import type { Icon } from '@ichava/js-ui-kernel';
export type { ExportEntry, ExportFormat };
/**
 * ExportService — real client-side multi-select export (plan §C / plan.new-features).
 * Produces an SVG sprite, a JSON manifest, or a zip bundling the sprite + manifest + one
 * SVG file per icon. No backend.
 *
 * Its logic lives in the export module (`@/modules/export`): the bytes in
 * `ExportBundle`, the download in `BrowserDownloader`. This class keeps its public
 * surface and forwards to them, so `exporter.export(format, icons)` is unchanged.
 */
export declare class ExportService {
    buildSprite(entries: ExportEntry[]): string;
    buildManifest(icons: Icon[]): string;
    /** One icon as a standalone file; see `ExportBundle.standaloneSvg`. */
    buildStandaloneSvg(e: ExportEntry): string;
    export(format: ExportFormat, icons: Icon[]): Promise<void>;
}
export declare const exporter: ExportService;
