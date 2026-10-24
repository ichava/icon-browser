import { type FC, type RefAttributes } from "react";
import type { ButtonProps as AriaButtonProps, MenuItemProps as AriaMenuItemProps, MenuProps as AriaMenuProps, PopoverProps as AriaPopoverProps, SeparatorProps as AriaSeparatorProps } from "react-aria-components";
import { MenuTrigger as AriaMenuTrigger } from "react-aria-components";
interface DropdownItemProps extends AriaMenuItemProps {
    /** The label of the item to be displayed. */
    label?: string;
    /** An addon to be displayed on the right side of the item. */
    addon?: string;
    /** If true, the item will not have any styles. */
    unstyled?: boolean;
    /** An icon to be displayed on the left side of the item. */
    icon?: FC<{
        className?: string;
    }>;
    /** Avatar URL to be displayed on the left side of the item. */
    avatarUrl?: string;
    /** The selection indicator to be displayed on the item. */
    selectionIndicator?: "checkmark" | "checkbox" | "radio" | "toggle" | "none";
}
declare const DropdownItem: ({ label, children, addon, icon: Icon, avatarUrl, unstyled, selectionIndicator, ...props }: DropdownItemProps) => import("react").JSX.Element;
type DropdownMenuProps<T extends object> = AriaMenuProps<T>;
declare const DropdownMenu: <T extends object>(props: DropdownMenuProps<T>) => import("react").JSX.Element;
type DropdownPopoverProps = AriaPopoverProps;
declare const DropdownPopover: (props: DropdownPopoverProps) => import("react").JSX.Element;
declare const DropdownSeparator: (props: AriaSeparatorProps) => import("react").JSX.Element;
declare const DropdownDotsButton: (props: AriaButtonProps & RefAttributes<HTMLButtonElement>) => import("react").JSX.Element;
export declare const Dropdown: {
    Root: typeof AriaMenuTrigger;
    Popover: typeof DropdownPopover;
    Menu: typeof DropdownMenu;
    Section: <T>(props: import("react-aria-components").MenuSectionProps<T> & React.RefAttributes<HTMLElement>) => import("react").ReactElement | null;
    SectionHeader: (props: import("react-aria-components").HeaderProps & React.RefAttributes<HTMLElement>) => React.ReactElement | null;
    Item: typeof DropdownItem;
    Separator: typeof DropdownSeparator;
    DotsButton: typeof DropdownDotsButton;
};
export {};
