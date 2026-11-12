import { useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, RefObject } from 'react';

/** How far the notice is moved from where its CSS places it, in px. */
export interface Offset {
  x: number;
  y: number;
}

/** The notice's box at offset zero: where its CSS anchors it. */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const ORIGIN: Offset = { x: 0, y: 0 };

/** The gap kept between the notice and every viewport edge. */
export const EDGE_MARGIN = 8;

/** One arrow press, and one with Shift held. */
export const KEY_STEP = 16;
export const KEY_STEP_LARGE = 64;

/**
 * The nearest offset that keeps `base` moved by `offset` inside the viewport, or null when
 * the box cannot fit at all (the window is smaller than the notice plus its margins).
 * Null is the "too small" signal: the caller puts the notice back where its CSS places it,
 * which always lays out, rather than pinning it half off-screen.
 */
export function clampOffset(offset: Offset, base: Box, viewport: { width: number; height: number }, margin = EDGE_MARGIN): Offset | null {
  const minX = margin - base.left;
  const maxX = viewport.width - margin - base.right;
  const minY = margin - base.top;
  const maxY = viewport.height - margin - base.bottom;
  if (minX > maxX || minY > maxY) return null;
  return { x: Math.min(maxX, Math.max(minX, offset.x)), y: Math.min(maxY, Math.max(minY, offset.y)) };
}

/** A stored offset, or null for anything that is not one (absent, unreadable, tampered). */
export function readOffset(key: string): Offset | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const v = JSON.parse(raw) as unknown;
    if (v && typeof v === 'object' && Number.isFinite((v as Offset).x) && Number.isFinite((v as Offset).y)) {
      return { x: (v as Offset).x, y: (v as Offset).y };
    }
  } catch {
    // Storage blocked (private mode, sandboxed frame) or a value that is not JSON.
  }
  return null;
}

/** Store or forget an offset. Storage failing only costs the position on the next load. */
export function writeOffset(key: string, offset: Offset | null): void {
  try {
    if (offset === null || (offset.x === 0 && offset.y === 0)) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify({ x: Math.round(offset.x), y: Math.round(offset.y) }));
  } catch {
    // As above.
  }
}

const KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

/**
 * `desired`, clamped against `el`'s box at its anchor (its box now, less the offset it is
 * drawn at); ORIGIN when nothing fits. An element that is not laid out (jsdom,
 * `display: none`) has no box to clamp against, so the offset passes through.
 */
function placeWithin(el: HTMLElement | null, drawnAt: Offset, desired: Offset): Offset {
  if (!el) return desired;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return desired;
  const base = { left: r.left - drawnAt.x, top: r.top - drawnAt.y, right: r.right - drawnAt.x, bottom: r.bottom - drawnAt.y };
  return clampOffset(desired, base, { width: window.innerWidth, height: window.innerHeight }) ?? ORIGIN;
}

/**
 * Moves a fixed-position notice by a handle, with the pointer (mouse, pen, touch) or the
 * keyboard, and keeps it inside the viewport.
 *
 * The notice keeps its CSS anchor and is moved with `translate`, so the anchor is still
 * what decides where it first appears (and flips with `start-*` in RTL); the offset is
 * relative to it. The position lasts for the session (sessionStorage), and is re-clamped on
 * every resize. When the window gets too small to hold the notice anywhere, the offset is
 * dropped and the notice goes back to its anchor.
 *
 * No manual `useCallback`: the React Compiler memoizes these, and reads through refs
 * (`current`, `drag`) are what keep a drag's handlers from going stale between renders.
 */
export function useDraggableNotice(target: RefObject<HTMLElement | null>, storageKey: string) {
  const [offset, setOffset] = useState<Offset>(() => readOffset(storageKey) ?? ORIGIN);
  const [dragging, setDragging] = useState(false);
  const current = useRef(offset);
  const drag = useRef<{ id: number; x: number; y: number; from: Offset } | null>(null);

  const apply = (next: Offset) => {
    current.current = next;
    setOffset(next);
  };

  const reset = () => {
    apply(ORIGIN);
    writeOffset(storageKey, null);
  };

  // A stored position from a larger window, then every resize: clamp, or reset when too small.
  useLayoutEffect(() => {
    const reclamp = () => {
      const next = placeWithin(target.current, current.current, current.current);
      if (next.x === current.current.x && next.y === current.current.y) return;
      current.current = next;
      setOffset(next);
      writeOffset(storageKey, next);
    };
    reclamp();
    window.addEventListener('resize', reclamp);
    return () => window.removeEventListener('resize', reclamp);
  }, [target, storageKey]);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // jsdom, or a pointer already released.
    }
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, from: current.current };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    apply(placeWithin(target.current, current.current, { x: d.from.x + e.clientX - d.x, y: d.from.y + e.clientY - d.y }));
  };

  const endDrag = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Already released.
    }
    writeOffset(storageKey, current.current);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key === 'Home') {
      e.preventDefault();
      reset();
      return;
    }
    const dir = KEYS[e.key];
    if (!dir) return;
    e.preventDefault();
    const step = e.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const next = placeWithin(target.current, current.current, { x: current.current.x + dir[0] * step, y: current.current.y + dir[1] * step });
    apply(next);
    writeOffset(storageKey, next);
  };

  return {
    offset,
    dragging,
    reset,
    handleProps: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag, onKeyDown },
    // `translate`, not `transform`: the notice's entrance animation owns `transform`, and
    // would hold a moved notice at its anchor until the animation ended.
    style: offset.x === 0 && offset.y === 0 ? undefined : { translate: `${offset.x}px ${offset.y}px` },
  };
}
