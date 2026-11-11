import type { ComponentPropsWithRef, ReactNode } from "react";
import type { InputProps as AriaInputProps } from "react-aria-components";
type CommandInputProps = AriaInputProps & ComponentPropsWithRef<"input"> & {
    placeholder?: string;
    shortcutKeys?: string[];
    tooltip?: ReactNode;
    className?: string;
};
export declare const CommandInput: ({ placeholder, shortcutKeys, tooltip, className, ...props }: CommandInputProps) => import("react").JSX.Element;
export {};
