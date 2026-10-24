import type { ListBoxItemProps as AriaListBoxItemProps } from "react-aria-components";
import type { SelectItemType } from "./select-shared";
interface SelectItemProps extends Omit<AriaListBoxItemProps<SelectItemType>, "id">, SelectItemType {
    /** The selection indicator to be displayed on the item. */
    selectionIndicator?: "checkmark" | "checkbox" | "none";
    /** The alignment of the selection indicator. */
    selectionIndicatorAlign?: "left" | "right";
}
export declare const SelectItem: ({ label, id, value, avatarUrl, supportingText, isDisabled, icon: Icon, className, children, selectionIndicator, selectionIndicatorAlign, ...props }: SelectItemProps) => import("react").JSX.Element;
export {};
