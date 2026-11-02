/**
 * raster — render an SVG string to a PNG blob via canvas (Vue-parity:
 * `Download.svgToPng`). Client-side, no backend. Used by the detail dialog's
 * PNG download option.
 */
export declare function svgToPng(svg: string, size?: number, background?: string | null): Promise<Blob>;
export declare function downloadBlob(name: string, blob: Blob): void;
