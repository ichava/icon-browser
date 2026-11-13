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
export function nextGridIndex(key: string, index: number, columns: number, count: number, opts: { rtl?: boolean; pageRows?: number } = {}): number | null {
  if (count <= 0) return null;
  const cols = Math.max(1, Math.floor(columns));
  const page = Math.max(1, Math.floor(opts.pageRows ?? 3)) * cols;
  const forward = opts.rtl ? 'ArrowLeft' : 'ArrowRight';
  const back = opts.rtl ? 'ArrowRight' : 'ArrowLeft';
  let next: number;
  switch (key) {
    case forward: next = index + 1; break;
    case back: next = index - 1; break;
    case 'ArrowDown': next = index + cols; break;
    case 'ArrowUp': next = index - cols; break;
    case 'PageDown': next = Math.min(count - 1, index + page); break;
    case 'PageUp': next = Math.max(0, index - page); break;
    case 'Home': next = 0; break;
    case 'End': next = count - 1; break;
    default: return null;
  }
  if (next < 0 || next >= count || next === index) return null;
  return next;
}

/** Columns that fit `width`, matching `repeat(auto-fill, minmax(minTile, 1fr))` with `gap`. */
export function gridColumns(width: number, minTile: number, gap: number): number {
  if (!(width > 0)) return 1;
  return Math.max(1, Math.floor((width + gap) / (minTile + gap)));
}
