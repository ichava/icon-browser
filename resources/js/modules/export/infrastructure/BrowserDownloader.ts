import type { ExportFile } from '../domain/ExportBundle';
import type { ExportDownloader } from '../application/exportIcons';

/** Downloads a file through an object URL and a clicked anchor. */
export class BrowserDownloader implements ExportDownloader {
  download(file: ExportFile): void {
    const blob = new Blob([file.bytes as BlobPart], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }
}
