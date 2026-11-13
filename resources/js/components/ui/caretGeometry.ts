/*
 * The caret's geometry, apart from the component so that the component file exports only
 * components (fast refresh) and the shapes can be tested without react-aria laying out.
 */

/** The caret's base and height, in px. */
export const CARET_BASE = 14;
export const CARET_HEIGHT = 8;

/**
 * How far the caret's base is kept from the panel's ends (react-aria's `arrowBoundaryOffset`).
 *
 * Small on purpose. The header triggers are 30px and their panels align to the trigger's end,
 * so the trigger's centre is 15px from the panel's end, and react-aria clamps the caret to
 * `boundary + CARET_BASE / 2` from it. A boundary of 14 clamped it to 21px: 6px off the
 * trigger's centre, measured in Chromium. 6 keeps it on centre (13px <= 15px); the corner
 * radius is at most 10px, and its curve 8px in is a fifth of a pixel.
 */
export const CARET_CORNER_CLEARANCE = 6;

/**
 * How the panel draws its edge, which decides where the caret's base must sit to hide it.
 *
 * - `border`: a CSS `border` inside the panel's box (`Popover`'s dialog). The edge is the
 *   panel's first pixel row, so the caret reaches 1px *into* the panel to paint over it.
 * - `ring`: a 1px box-shadow ring outside the box (`MenuPopover`, Untitled UI's dropdown).
 *   The edge is the row just outside the panel, which the caret's base already covers.
 */
export type CaretEdge = 'border' | 'ring';

type Side = 'top' | 'bottom' | 'left' | 'right';

/**
 * One path per side rather than a rotated SVG: a rotation turns the drawing but not its
 * layout box, so a 14x8 caret rotated a quarter turn still occupies 14x8 and sits off its
 * trigger. Each entry is the fill (closed) and the two slanted edges (open), so the stroke
 * draws the caret's sides and leaves its base open where it joins the panel.
 */
const SHAPES: Record<Side, { w: number; h: number; fill: string; edge: string }> = {
  // Panel below its trigger: caret on the panel's top edge, pointing up.
  bottom: { w: CARET_BASE, h: CARET_HEIGHT, fill: 'M0 8 L7 1 L14 8 Z', edge: 'M0 8 L7 1 L14 8' },
  // Panel above its trigger: caret on the bottom edge, pointing down.
  top: { w: CARET_BASE, h: CARET_HEIGHT, fill: 'M0 0 L7 7 L14 0 Z', edge: 'M0 0 L7 7 L14 0' },
  // Panel to the trigger's right: caret on the left edge, pointing left.
  right: { w: CARET_HEIGHT, h: CARET_BASE, fill: 'M8 0 L1 7 L8 14 Z', edge: 'M8 0 L1 7 L8 14' },
  // Panel to the trigger's left: caret on the right edge, pointing right.
  left: { w: CARET_HEIGHT, h: CARET_BASE, fill: 'M0 0 L7 7 L0 14 Z', edge: 'M0 0 L7 7 L0 14' },
};

/** Toward the panel, by `px`: the caret overlaps the panel's edge rather than sitting beside it. */
function inset(side: Side, px: number): string | undefined {
  if (px === 0) return undefined;
  switch (side) {
    case 'bottom':
      return `translateY(${px}px)`;
    case 'top':
      return `translateY(-${px}px)`;
    case 'right':
      return `translateX(${px}px)`;
    case 'left':
      return `translateX(-${px}px)`;
  }
}

function sideOf(placement: string | null | undefined): Side {
  return placement === 'top' || placement === 'left' || placement === 'right' ? placement : 'bottom';
}

/**
 * The caret for a panel placed `placement` of its trigger: its box, its fill and outline
 * paths, and the shift that lays its base over the panel's edge. Before react-aria has
 * measured (placement still null) it is the `bottom` caret, which is where every panel
 * here opens first.
 */
export function caretGeometry(placement: string | null | undefined, edge: CaretEdge) {
  const side = sideOf(placement);
  return { side, ...SHAPES[side], transform: inset(side, edge === 'border' ? 1 : 0) };
}
