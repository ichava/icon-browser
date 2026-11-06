/** The caret's base and height, in px. */
export declare const CARET_BASE = 14;
export declare const CARET_HEIGHT = 8;
/**
 * How far the caret's base is kept from the panel's ends (react-aria's `arrowBoundaryOffset`).
 *
 * Small on purpose. The header triggers are 30px and their panels align to the trigger's end,
 * so the trigger's centre is 15px from the panel's end, and react-aria clamps the caret to
 * `boundary + CARET_BASE / 2` from it. A boundary of 14 clamped it to 21px: 6px off the
 * trigger's centre, measured in Chromium. 6 keeps it on centre (13px <= 15px); the corner
 * radius is at most 10px, and its curve 8px in is a fifth of a pixel.
 */
export declare const CARET_CORNER_CLEARANCE = 6;
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
 * The caret for a panel placed `placement` of its trigger: its box, its fill and outline
 * paths, and the shift that lays its base over the panel's edge. Before react-aria has
 * measured (placement still null) it is the `bottom` caret, which is where every panel
 * here opens first.
 */
export declare function caretGeometry(placement: string | null | undefined, edge: CaretEdge): {
    w: number;
    h: number;
    fill: string;
    edge: string;
    side: Side;
    transform: string | undefined;
};
export {};
