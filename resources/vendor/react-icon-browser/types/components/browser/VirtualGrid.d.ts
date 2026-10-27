import { type ReactNode, type RefObject } from 'react';
import type { Icon } from '@ichava/js-ui-kernel';
/** Above this many icons the rows are windowed; below it every row is mounted. */
export declare const VIRTUALIZE_ABOVE = 120;
/**
 * IconGrid — the icon grid, as an ARIA grid (FINDINGS B4).
 *
 * It used to be a `role="grid"` whose children were the tiles themselves, which is the
 * `aria-required-children` failure axe reported: a grid owns rows, and rows own cells.
 * The rows here are real elements carrying `role="row"`, so the column count has to be
 * known in script rather than left to CSS `auto-fill`. `gridColumns()` reproduces the
 * auto-fill arithmetic exactly, which keeps the layout pixel-identical to the old CSS
 * grid -- each row is its own `repeat(columns, 1fr)` grid, and rows sit `gap` apart.
 *
 * Keyboard: one tab stop (roving tabindex), arrows move by cell and row, Home/End jump
 * to the ends. Moving onto a row the virtualiser has not mounted scrolls it into view
 * first and focuses the cell once it exists.
 */
export declare function IconGrid({ items, size, scrollRef, label }: {
    items: Icon[];
    size: number;
    scrollRef: RefObject<HTMLDivElement | null>;
    label: string;
}): import("react").JSX.Element;
/**
 * VirtualGrid — row-windowed rendering for large pages (plan P5). Only rows in view are
 * mounted, so a 240-icon page stays smooth. Rows come from IconGrid's `renderRow`, so
 * the windowed and the plain path share one row and cell structure.
 *
 * The row holding the roving tab stop stays mounted even when scrolled away, so Tab
 * always has somewhere to land in the grid.
 */
export declare function VirtualGrid({ rowCount, rowHeight, gap, scrollRef, ready, activeRow, scrollToRowRef, renderRow, }: {
    rowCount: number;
    rowHeight: number;
    gap: number;
    scrollRef: RefObject<HTMLDivElement | null>;
    ready: boolean;
    activeRow: number;
    scrollToRowRef: RefObject<((row: number) => void) | null>;
    renderRow: (row: number, style?: React.CSSProperties) => ReactNode;
}): import("react").JSX.Element;
