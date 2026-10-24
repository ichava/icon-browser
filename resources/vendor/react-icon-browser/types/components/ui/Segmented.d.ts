/**
 * Segmented — a compact single-choice control on Untitled UI's `ButtonGroup` (a react-aria
 * `ToggleButtonGroup`), restyled to the app's segmented track.
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
