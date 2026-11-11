import type { Icon } from '@ichava/js-ui-kernel';
import { ExportBundle, type ExportFormat } from './domain/ExportBundle';
export { ExportBundle, ASSET_EXPORT_FORMATS, NATIVE_EXPORT_FORMATS, encodeSvgDataUri, type AssetExportFormat, type NativeExportFormat, type ExportEntry, type ExportFile, type ExportFormat, type ExportNaming, type ExportSanitizer, } from './domain/ExportBundle';
export { exportIcons, type ExportDownloader, type ExportPartsSource } from './application/exportIcons';
export { BrowserDownloader } from './infrastructure/BrowserDownloader';
/**
 * The app's bundle: names from the catalog, and the svg module's sanitiser for the asset
 * exports. Sprite ids share `packShort` with `iconRef`, so the two cannot drift.
 */
export declare const exportBundle: ExportBundle;
/** Export `icons` as `format` with the app's bundle, the svg module's parts cache and a browser download. */
export declare function exportToBrowser(format: ExportFormat, icons: Icon[]): Promise<void>;
