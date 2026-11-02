import type { ReactNode, Ref } from "react";
import { type CheckboxProps as AriaCheckboxProps } from "react-aria-components";
export interface CheckboxBaseProps {
    size?: "sm" | "md";
    className?: string;
    isFocusVisible?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    isIndeterminate?: boolean;
}
export declare function CheckboxBase({ className, isSelected, isDisabled, isIndeterminate, size, isFocusVisible }: CheckboxBaseProps): import("react").JSX.Element;
export declare namespace CheckboxBase {
    var displayName: string;
}
interface CheckboxProps extends AriaCheckboxProps {
    ref?: Ref<HTMLLabelElement>;
    size?: "sm" | "md";
    label?: ReactNode;
    hint?: ReactNode;
}
export declare function Checkbox({ label, hint, size, className, ...ariaCheckboxProps }: CheckboxProps): import("react").JSX.Element;
export declare namespace Checkbox {
    var displayName: string;
}
export {};
