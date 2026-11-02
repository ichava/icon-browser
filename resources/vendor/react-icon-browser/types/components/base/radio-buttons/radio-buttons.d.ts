import { type ReactNode, type Ref } from "react";
import { type RadioGroupProps as AriaRadioGroupProps, type RadioProps as AriaRadioProps } from "react-aria-components";
export interface RadioGroupContextType {
    /** Size applied to every `RadioButton` inside the group through context, taking precedence over a `size` set on the individual radio. */
    size?: "sm" | "md";
}
export interface RadioButtonBaseProps {
    /** Controls the diameter of the circle and of the dot rendered inside it. */
    size?: "sm" | "md";
    /** Additional classes merged onto the circle element. */
    className?: string;
    /** Whether to draw the keyboard focus ring around the circle. Normally passed down by `RadioButton` from React Aria's render state rather than set by hand. */
    isFocusVisible?: boolean;
    /** Whether to render the checked appearance: brand-filled circle with the inner dot faded in. Normally passed down by `RadioButton` rather than set by hand. */
    isSelected?: boolean;
    /** Whether to render the dimmed, not-allowed appearance. Normally passed down by `RadioButton` rather than set by hand. */
    isDisabled?: boolean;
}
export declare function RadioButtonBase({ className, isFocusVisible, isSelected, isDisabled, size }: RadioButtonBaseProps): import("react").JSX.Element;
export declare namespace RadioButtonBase {
    var displayName: string;
}
interface RadioButtonProps extends AriaRadioProps {
    /** Controls the circle size, the gap between it and the text, and the label and hint typography. Ignored when a surrounding `RadioGroup` sets a size. */
    size?: "sm" | "md";
    /** Content rendered beside the circle. It sits inside the radio's label element, so it also acts as the accessible name and selects the radio when clicked. */
    label?: ReactNode;
    /** Supporting text rendered under the label. Clicks on it are stopped so reading the hint does not select the radio. */
    hint?: ReactNode;
    /** Ref to the underlying label element that wraps the circle and the text. */
    ref?: Ref<HTMLLabelElement>;
}
export declare function RadioButton({ label, hint, className, size, ...ariaRadioProps }: RadioButtonProps): import("react").JSX.Element;
export declare namespace RadioButton {
    var displayName: string;
}
interface RadioGroupProps extends RadioGroupContextType, AriaRadioGroupProps {
    /** The `RadioButton` elements belonging to the group, stacked in a vertical column. */
    children: ReactNode;
    /** Additional classes merged onto the group wrapper that lays the radios out. */
    className?: string;
}
export declare const RadioGroup: ({ children, className, size, ...props }: RadioGroupProps) => import("react").JSX.Element;
export {};
