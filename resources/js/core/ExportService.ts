import { exportBundle, exportToBrowser, type ExportEntry, type ExportFormat } from '@/modules/export';
import type { Icon } from '@ichava/js-ui-kernel';

export type { ExportEntry, ExportFormat };

/**
 * ExportService — real client-side multi-select export (plan §C / plan.new-features).
 * Produces an SVG sprite, a JSON manifest, a zip bundling the sprite + manifest + one
 * SVG file per icon, or (schema 1.6.0) a CSS mask sheet or a data-URI sheet.
 * No backend.
 *
 * Its logic lives in the export module (`@/modules/export`): the bytes in
 * `ExportBundle`, the download in `BrowserDownloader`. This class keeps its public
 * surface and forwards to them, so `exporter.export(format, icons)` is unchanged.
 */
export class ExportService {
  buildSprite(entries: ExportEntry[]): string {
    return exportBundle.sprite(entries);
  }

  buildManifest(icons: Icon[]): string {
    return exportBundle.manifest(icons);
  }

  /** One icon as a standalone file; see `ExportBundle.standaloneSvg`. */
  buildStandaloneSvg(e: ExportEntry): string {
    return exportBundle.standaloneSvg(e);
  }

  /** One icon as a percent-encoded data URI, from sanitised SVG ("Copy as data URI"). */
  buildDataUri(e: ExportEntry): string {
    return exportBundle.dataUri(e);
  }

  /** A CSS mask sheet for `entries`, from sanitised SVG. */
  buildCssMask(entries: ExportEntry[]): string {
    return exportBundle.cssMask(entries);
  }

  async export(format: ExportFormat, icons: Icon[]): Promise<void> {
    return exportToBrowser(format, icons);
  }
}

export const exporter = new ExportService();
