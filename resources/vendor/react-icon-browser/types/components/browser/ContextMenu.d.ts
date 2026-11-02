/**
 * ContextMenu — a REUSABLE, data-driven context menu (plan Part D). Renders whatever
 * `store.ctx.items` supplies (label/icon/run/danger/disabled/divider/kbd), so any
 * component can `openCtx(x, y, items, title?)`. Cursor-positioned with a measured
 * viewport clamp; roving arrow-key/Enter/Home/End nav + role=menu; closes on outside
 * click / Escape / scroll / resize.
 */
export declare function ContextMenu(): import("react").ReactPortal | null;
