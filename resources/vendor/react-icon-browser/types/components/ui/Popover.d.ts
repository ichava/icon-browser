import { type CSSProperties, type ReactNode } from 'react';
/**
 * Popover — trigger + panel, on Untitled UI's overlay stack (react-aria).
 *
 * The public API (`trigger`, `children(close)`, `align`, `drop`, `width`, `panelStyle`) is
 * unchanged, so all eight call sites are untouched by the swap.
 *
 * This was Radix Popover, and it had to move for the same reason Selects were unusable
 * inside Modals: two overlay systems do not agree about stacking or about
 * `pointer-events`. With modal, tooltip, select and popover all on react-aria, the layer
 * scale in `theme.css` is the single thing deciding what sits above what.
 *
 * The trigger is wrapped in `Pressable` because `DialogTrigger` needs a child that accepts
 * press interactions, and every call site passes a plain styled `<button>`. Same reasoning
 * as `Focusable` in the Tooltip: adapt the element rather than force eight call sites to
 * become react-aria `Button`s and lose their `iconBtn()` styling.
 */
export declare function Popover({ trigger, children, align, drop, width, panelStyle, label, tooltip, }: {
    /**
     * The trigger's tooltip (the design-system one). Wrapped around the Pressable here,
     * because the trigger render-prop must return the DOM button itself.
     */
    tooltip?: ReactNode;
    /**
     * The panel's accessible name, translated by the caller. Required: every popover used
     * to be announced as "Popover", in English, in every locale (A6-gaps G8).
     */
    label: string;
    trigger: (open: boolean, toggle: () => void) => ReactNode;
    children: (close: () => void) => ReactNode;
    align?: 'left' | 'right';
    drop?: 'down' | 'up';
    width?: number;
    panelStyle?: CSSProperties;
}): import("react").JSX.Element;
