/**
 * Segmented — a compact single-choice control on Untitled UI's `ButtonGroup` (a react-aria
 * `ToggleButtonGroup`), restyled to Ichava's square segments: a hairline track, the
 * selected segment a flat accent tint, hover a muted fill and press a slight scale. Not
 * Untitled UI's white pill in a grey track.
 *
 * `role="radiogroup"` of `radio`s with one tab stop and arrow keys from react-aria. The
 * hand-rolled segments it replaces declared `role="radio"` on plain buttons, with no group
 * and no arrow keys behind them.
 *
 * The unselected-shadow reset is a selector, not `shadow-none`: tailwind-merge does not
 * know `shadow-skeuomorphic` is a shadow size, so it keeps both and the skeuomorphic one
 * wins (see the variant band in `CategoryTree.tsx`).
 */
export declare function Segmented<K extends string>({ label, value, options, onChange, className, itemClassName, }: {
    /** Accessible name of the group. */
    label: string;
    value: K;
    options: {
        id: K;
        label: string;
    }[];
    onChange: (id: K) => void;
    className?: string;
    itemClassName?: string;
}): import("react").JSX.Element;
