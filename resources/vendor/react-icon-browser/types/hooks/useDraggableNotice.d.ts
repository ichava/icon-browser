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
export declare const ORIGIN: Offset;
/** The gap kept between the notice and every viewport edge. */
export declare const EDGE_MARGIN = 8;
/** One arrow press, and one with Shift held. */
export declare const KEY_STEP = 16;
export declare const KEY_STEP_LARGE = 64;
/**
 * The nearest offset that keeps `base` moved by `offset` inside the viewport, or null when
 * the box cannot fit at all (the window is smaller than the notice plus its margins).
 * Null is the "too small" signal: the caller puts the notice back where its CSS places it,
 * which always lays out, rather than pinning it half off-screen.
 */
export declare function clampOffset(offset: Offset, base: Box, viewport: {
    width: number;
    height: number;
}, margin?: number): Offset | null;
/** A stored offset, or null for anything that is not one (absent, unreadable, tampered). */
export declare function readOffset(key: string): Offset | null;
/** Store or forget an offset. Storage failing only costs the position on the next load. */
export declare function writeOffset(key: string, offset: Offset | null): void;
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
export declare function useDraggableNotice(target: RefObject<HTMLElement | null>, storageKey: string): {
    offset: Offset;
    dragging: boolean;
    reset: () => void;
    handleProps: {
        onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
        onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
        onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
        onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
        onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
    };
    style: {
        translate: string;
    } | undefined;
};
