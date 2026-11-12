import type { Icon } from '@ichava/js-ui-kernel';
import type { ExportBundle, ExportEntry, ExportFile, ExportFormat } from '../domain/ExportBundle';

/** Reads an icon's SVG parts (the svg module's cache, in the app). */
export type ExportPartsSource = (icon: Icon) => Promise<Omit<ExportEntry, 'icon'>> | Omit<ExportEntry, 'icon'>;

/** Hands a built file to the user (a browser download, in the app). */
export interface ExportDownloader {
  download(file: ExportFile): void;
}

/**
 * Export `icons` as `format`: read their parts (a manifest needs none), build the file,
 * download it. Nothing happens for an empty selection.
 */
export async function exportIcons(
  format: ExportFormat,
  icons: Icon[],
  deps: { bundle: ExportBundle; parts: ExportPartsSource; downloader: ExportDownloader },
): Promise<void> {
  if (!icons.length) return;
  const entries: ExportEntry[] =
    format === 'manifest'
      ? icons.map((icon) => ({ icon, body: '', viewBox: icon.viewBox }))
      : await Promise.all(
          icons.map(async (icon) => {
            const p = await Promise.resolve(deps.parts(icon));
            return { icon, body: p.body, viewBox: p.viewBox, rootAttrs: p.rootAttrs ?? '' };
          }),
        );
  deps.downloader.download(deps.bundle.build(format, entries));
}
