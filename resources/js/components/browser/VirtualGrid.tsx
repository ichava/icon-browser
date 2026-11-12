import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { IconTile } from './IconTile';

import { densityMetrics, tileMinWidth } from '@/core/appScale';
import { gridColumns, nextGridIndex } from '@/core/gridNav';
import type { Icon } from '@ichava/js-ui-kernel';
import { useAppStore } from '@/hooks/useStoreApi';

/** Above this many icons the rows are windowed; below it every row is mounted. */
export const VIRTUALIZE_ABOVE = 120;

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
export function IconGrid({ items, size, scrollRef, label }: { items: Icon[]; size: number; scrollRef: RefObject<HTMLDivElement | null>; label: string }) {
  const density = useAppStore((s) => s.density);
  const { gap } = densityMetrics(density);
  const minTile = tileMinWidth(size, density);
  const [width, setWidth] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<number | null>(null);
  const scrollToRowRef = useRef<((row: number) => void) | null>(null);
  const [active, setActive] = useState(0);

  // Measured before paint, so the first frame already has the right column count.
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columns = gridColumns(width, minTile, gap);
  const rowCount = Math.ceil(items.length / columns);
  const activeIndex = Math.min(active, Math.max(0, items.length - 1));
  const virtualize = items.length > VIRTUALIZE_ABOVE;

  const focusCell = (index: number) => {
    setActive(index);
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-grid-index="${index}"]`);
    if (el) {
      el.focus();
      return;
    }
    pendingFocus.current = index;
    scrollToRowRef.current?.(Math.floor(index / columns));
  };

  // A cell scrolled into view by keyboard movement mounts on a later render.
  useEffect(() => {
    const i = pendingFocus.current;
    if (i == null) return;
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-grid-index="${i}"]`);
    if (el) {
      pendingFocus.current = null;
      el.focus();
    }
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const raw = target.getAttribute('data-grid-index');
    if (raw == null) return; // a control inside a tile, not the tile itself
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const viewport = scrollRef.current?.clientHeight ?? 0;
    const rowPx = width > 0 ? (width - (columns - 1) * gap) / columns + gap : 0;
    const pageRows = rowPx > 0 && viewport > 0 ? Math.max(1, Math.floor(viewport / rowPx)) : 3;
    const next = nextGridIndex(e.key, Number(raw), columns, items.length, { rtl, pageRows });
    if (next == null) return;
    e.preventDefault();
    focusCell(next);
  };

  const renderRow = (rowIndex: number, style?: React.CSSProperties): ReactNode => {
    const start = rowIndex * columns;
    return (
      <div
        key={rowIndex}
        role="row"
        aria-rowindex={rowIndex + 1}
        style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap, ...style }}
      >
        {items.slice(start, start + columns).map((icon, c) => {
          const index = start + c;
          return (
            <IconTile
              key={icon.id}
              icon={icon}
              size={size}
              gridIndex={index}
              colIndex={c + 1}
              tabIndex={index === activeIndex ? 0 : -1}
              onCellFocus={setActive}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label={label}
      aria-rowcount={rowCount}
      aria-colcount={columns}
      onKeyDown={onKeyDown}
      style={virtualize ? { width: '100%', gap } : { display: 'flex', flexDirection: 'column', gap, width: '100%' }}
    >
      {virtualize ? (
        <VirtualGrid
          rowCount={rowCount}
          rowHeight={(width > 0 ? (width - (columns - 1) * gap) / columns : minTile) + gap}
          gap={gap}
          scrollRef={scrollRef}
          ready={width > 0}
          activeRow={Math.floor(activeIndex / columns)}
          scrollToRowRef={scrollToRowRef}
          renderRow={renderRow}
        />
      ) : (
        Array.from({ length: rowCount }, (_, r) => renderRow(r))
      )}
    </div>
  );
}

/**
 * VirtualGrid — row-windowed rendering for large pages (plan P5). Only rows in view are
 * mounted, so a 240-icon page stays smooth. Rows come from IconGrid's `renderRow`, so
 * the windowed and the plain path share one row and cell structure.
 *
 * The row holding the roving tab stop stays mounted even when scrolled away, so Tab
 * always has somewhere to land in the grid.
 */
export function VirtualGrid({
  rowCount,
  rowHeight,
  gap,
  scrollRef,
  ready,
  activeRow,
  scrollToRowRef,
  renderRow,
}: {
  rowCount: number;
  rowHeight: number;
  gap: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  ready: boolean;
  activeRow: number;
  scrollToRowRef: RefObject<((row: number) => void) | null>;
  renderRow: (row: number, style?: React.CSSProperties) => ReactNode;
}) {
  // TanStack Virtual returns functions whose results change while the object's identity does
  // not, so the React Compiler skips this component. Nothing here is compiled (the build runs no
  // compiler) and nothing memoises the virtualizer's results, so the skip is the right outcome.
  // eslint-disable-next-line react-hooks/incompatible-library -- third-party API, see above
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 4,
    rangeExtractor: (range) => {
      const rows: number[] = [];
      for (let i = Math.max(0, range.startIndex - range.overscan); i <= Math.min(range.count - 1, range.endIndex + range.overscan); i++) rows.push(i);
      if (activeRow < range.count && !rows.includes(activeRow)) rows.push(activeRow);
      return rows.sort((a, b) => a - b);
    },
  });
  // Re-measure rows when density/scale changes the row height.
  useEffect(() => virtualizer.measure(), [rowHeight, virtualizer]);
  useEffect(() => {
    scrollToRowRef.current = (row) => virtualizer.scrollToIndex(row, { align: 'auto' });
    return () => {
      scrollToRowRef.current = null;
    };
  }, [virtualizer, scrollToRowRef]);

  return (
    <div role="presentation" style={{ position: 'relative', height: virtualizer.getTotalSize(), width: '100%' }}>
      {ready &&
        virtualizer.getVirtualItems().map((vRow) =>
          renderRow(vRow.index, { position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vRow.start}px)`, paddingBottom: gap }),
        )}
    </div>
  );
}
