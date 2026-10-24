import { type ComponentType, type HTMLAttributes, type ReactNode, type Ref } from "react";
import type { InputProps as AriaInputProps, TextFieldProps as AriaTextFieldProps } from "react-aria-components";
export interface InputBaseProps extends Omit<AriaInputProps, "size"> {
    /** Tooltip message on hover. */
    tooltip?: string;
    /** Whether the input is invalid. */
    isInvalid?: boolean;
    /** Whether the input is disabled. */
    isDisabled?: boolean;
    /** Whether the input is required. */
    isRequired?: boolean;
    /**
     * Input size.
     * @default "sm"
     */
    size?: "sm" | "md" | "lg";
    /** Placeholder text. */
    placeholder?: string;
    /** Class name for the icon. */
    iconClassName?: string;
    /** Class name for the input. */
    inputClassName?: string;
    /** Class name for the input wrapper. */
    wrapperClassName?: string;
    /** Class name for the tooltip. */
    tooltipClassName?: string;
    /** Keyboard shortcut to display. */
    shortcut?: string | boolean;
    ref?: Ref<HTMLInputElement>;
    groupRef?: Ref<HTMLDivElement>;
    /** Icon component to display on the left side of the input. */
    icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement>>;
    /**
     * Accessible name for the password visibility toggle. Supply a translated string;
     * defaults to English.
     */
    passwordToggleLabel?: string;
}
export declare function InputBase({ ref, tooltip, shortcut, groupRef, size, isInvalid, isDisabled, isRequired, icon: Icon, placeholder, passwordToggleLabel, wrapperClassName, tooltipClassName, inputClassName, iconClassName, type, ...inputProps }: InputBaseProps): import("react").JSX.Element;
export declare namespace InputBase {
    var displayName: string;
}
interface TextFieldContextProps extends Partial<Pick<InputBaseProps, "size" | "wrapperClassName" | "inputClassName" | "iconClassName" | "tooltipClassName">> {
}
export interface TextFieldProps extends AriaTextFieldProps, TextFieldContextProps {
}
export declare function TextField({ className, size, inputClassName, wrapperClassName, iconClassName, tooltipClassName, ...props }: TextFieldProps): import("react").JSX.Element;
export declare namespace TextField {
    var displayName: string;
}
export interface InputProps extends AriaTextFieldProps, Pick<InputBaseProps, "ref" | "placeholder" | "icon" | "shortcut" | "tooltip" | "groupRef" | "size" | "passwordToggleLabel" | "wrapperClassName" | "inputClassName" | "iconClassName" | "tooltipClassName"> {
    /** Label text for the input */
    label?: string;
    /** Helper text displayed below the input */
    hint?: ReactNode;
    /** Whether to hide required indicator from label */
    hideRequiredIndicator?: boolean;
}
export declare function Input({ size, placeholder, icon: Icon, label, hint, shortcut, hideRequiredIndicator, className, ref, groupRef, tooltip, iconClassName, inputClassName, passwordToggleLabel, wrapperClassName, tooltipClassName, type, ...props }: InputProps): import("react").JSX.Element;
export declare namespace Input {
    var displayName: string;
}
export {};
