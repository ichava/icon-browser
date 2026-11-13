// The export bounded context (architecture.md 3.2): the pure bundle builder (domain), the
// export use case (application) and the browser download (infrastructure). Other modules
// and the app reach it only through this file.
import type { Icon } from '@ichava/js-ui-kernel';
import { iconRef, packShort } from '@/modules/catalog';
import { getSvgParts, sanitizeSvg } from '@/modules/svg';

import { ExportBundle, type ExportFormat } from './domain/ExportBundle';
import { exportIcons } from './application/exportIcons';
import { BrowserDownloader } from './infrastructure/BrowserDownloader';

export {
  ExportBundle,
  ASSET_EXPORT_FORMATS,
  NATIVE_EXPORT_FORMATS,
  encodeSvgDataUri,
  type AssetExportFormat,
  type NativeExportFormat,
  type ExportEntry,
  type ExportFile,
  type ExportFormat,
  type ExportNaming,
  type ExportSanitizer,
} from './domain/ExportBundle';
export { exportIcons, type ExportDownloader, type ExportPartsSource } from './application/exportIcons';
export { BrowserDownloader } from './infrastructure/BrowserDownloader';

/**
 * The app's bundle: names from the catalog, and the svg module's sanitiser for the asset
 * exports. Sprite ids share `packShort` with `iconRef`, so the two cannot drift.
 */
export const exportBundle = new ExportBundle({ ref: iconRef, slug: (icon) => `${packShort(icon)}-${icon.name}` }, { sanitize: sanitizeSvg });

/** Export `icons` as `format` with the app's bundle, the svg module's parts cache and a browser download. */
export function exportToBrowser(format: ExportFormat, icons: Icon[]): Promise<void> {
  return exportIcons(format, icons, { bundle: exportBundle, parts: getSvgParts, downloader: new BrowserDownloader() });
}
