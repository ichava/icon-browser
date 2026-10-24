import type { FC, ReactNode, RefAttributes } from "react";
import type { ComboBoxProps as AriaComboBoxProps, ListBoxProps as AriaListBoxProps } from "react-aria-components";
import { type CommonProps, type SelectItemType } from "./select-shared";
interface ComboBoxProps extends Omit<AriaComboBoxProps<SelectItemType>, "children" | "items">, RefAttributes<HTMLDivElement>, CommonProps {
    shortcut?: boolean;
    items?: SelectItemType[];
    popoverClassName?: string;
    shortcutClassName?: string;
    /** Leading icon component displayed before the input. */
    icon?: FC | ReactNode;
    children: AriaListBoxProps<SelectItemType>["children"];
}
export declare const ComboBox: ({ placeholder, shortcut, size, children, items, shortcutClassName, icon, hideRequiredIndicator, ...otherProps }: ComboBoxProps) => import("react").JSX.Element;
export {};
