import type { Icon } from '@ichava/js-ui-kernel';
import { ExportBundle, type ExportFormat } from './domain/ExportBundle';
export { ExportBundle, type ExportEntry, type ExportFile, type ExportFormat, type ExportNaming } from './domain/ExportBundle';
export { exportIcons, type ExportDownloader, type ExportPartsSource } from './application/exportIcons';
export { BrowserDownloader } from './infrastructure/BrowserDownloader';
/** The app's bundle: names from the catalog. Sprite ids share `packShort` with `iconRef`, so the two cannot drift. */
export declare const exportBundle: ExportBundle;
/** Export `icons` as `format` with the app's bundle, the svg module's parts cache and a browser download. */
export declare function exportToBrowser(format: ExportFormat, icons: Icon[]): Promise<void>;
