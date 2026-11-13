/**
 * download — hand a blob to the browser as a file download. Used by the detail
 * dialog's SVG, CSS mask and data-URI actions. Moved verbatim from the former
 * `core/raster.ts`, whose PNG renderer was removed: the ichava icon ecosystem is
 * strictly SVG (owner rule, 2026-11-04).
 */
export function downloadBlob(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
