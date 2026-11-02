import type { ReactNode } from "react";
import type { SwitchProps as AriaSwitchProps } from "react-aria-components";
interface ToggleBaseProps {
    /** Controls the track and knob dimensions, and how far the knob slides when selected. */
    size?: "sm" | "md";
    /** Renders the compact variant: an unpadded track with a bordered knob that overlaps its edges instead of sitting inside them. */
    slim?: boolean;
    /** Additional classes merged onto the track element. */
    className?: string;
    /** Whether to darken the track while selected, for the hover appearance. Normally passed down by `Toggle` from React Aria's render state rather than set by hand. */
    isHovered?: boolean;
    /** Whether to draw the keyboard focus ring around the track. Normally passed down by `Toggle` rather than set by hand. */
    isFocusVisible?: boolean;
    /** Whether to render the on appearance: brand-filled track with the knob slid to the right. Normally passed down by `Toggle` rather than set by hand. */
    isSelected?: boolean;
    /** Whether to render the dimmed, not-allowed appearance. Normally passed down by `Toggle` rather than set by hand. */
    isDisabled?: boolean;
}
export declare const ToggleBase: ({ className, isHovered, isDisabled, isFocusVisible, isSelected, slim, size }: ToggleBaseProps) => import("react").JSX.Element;
interface ToggleProps extends AriaSwitchProps {
    /** Controls the toggle dimensions, the gap between it and the text, and the label and hint typography. */
    size?: "sm" | "md";
    /** Text rendered beside the toggle. It sits inside the switch's label element, so it also acts as the accessible name and flips the toggle when clicked. */
    label?: string;
    /** Supporting text rendered under the label. Clicks on it are stopped so reading the hint does not flip the toggle. */
    hint?: ReactNode;
    /** Renders the compact toggle variant, with a shorter track and a bordered knob that overlaps its edges. */
    slim?: boolean;
}
export declare const Toggle: ({ label, hint, className, size, slim, ...ariaSwitchProps }: ToggleProps) => import("react").JSX.Element;
export {};
