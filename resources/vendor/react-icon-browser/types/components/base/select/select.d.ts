import type { FC, ReactNode, RefAttributes } from "react";
import type { SelectProps as AriaSelectProps } from "react-aria-components";
import { ComboBox } from "./combobox";
import { SelectItem } from "./select-item";
import { type CommonProps, type SelectItemType } from "./select-shared";
export { SelectContext, sizes, type CommonProps, type SelectItemType } from "./select-shared";
export interface SelectProps extends Omit<AriaSelectProps<SelectItemType>, "children" | "items">, RefAttributes<HTMLDivElement>, CommonProps {
    items?: SelectItemType[];
    popoverClassName?: string;
    icon?: FC | ReactNode;
    children: ReactNode | ((item: SelectItemType) => ReactNode);
}
declare const Select: ({ placeholder, icon, size, children, items, label, hint, tooltip, hideRequiredIndicator, className, ...rest }: SelectProps) => import("react").JSX.Element;
declare const _Select: typeof Select & {
    ComboBox: typeof ComboBox;
    Item: typeof SelectItem;
};
export { _Select as Select };
