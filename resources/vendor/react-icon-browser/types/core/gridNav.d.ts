/**
 * Keyboard movement inside the icon grid (FINDINGS B4).
 *
 * The grid reflows with the window, so its column count is a runtime value rather than
 * a property of the data. Movement is therefore computed from a flat index and the live
 * column count: Left/Right step through the catalog order (wrapping across rows, which
 * is what a reflowing gallery reads as), Up/Down move a whole row, Home/End jump to the
 * first and last icon.
 *
 * Returns the target index, or null when the key is not a grid movement key or the move
 * would leave the grid -- so the caller only prevents default for keys it handled.
 */
export type GridKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Home' | 'End' | 'PageUp' | 'PageDown';
export declare function nextGridIndex(key: string, index: number, columns: number, count: number, opts?: {
    rtl?: boolean;
    pageRows?: number;
}): number | null;
/** Columns that fit `width`, matching `repeat(auto-fill, minmax(minTile, 1fr))` with `gap`. */
export declare function gridColumns(width: number, minTile: number, gap: number): number;
