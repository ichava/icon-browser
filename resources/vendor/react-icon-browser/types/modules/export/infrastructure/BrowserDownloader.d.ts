import type { ExportFile } from '../domain/ExportBundle';
import type { ExportDownloader } from '../application/exportIcons';
/** Downloads a file through an object URL and a clicked anchor. */
export declare class BrowserDownloader implements ExportDownloader {
    download(file: ExportFile): void;
}
