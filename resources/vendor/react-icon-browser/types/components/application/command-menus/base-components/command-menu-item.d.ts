import type { FC } from "react";
import { type ListBoxItemProps } from "react-aria-components";
interface CommandMenuItemBaseType {
    id: string;
    label: string;
    description?: string;
    stacked?: boolean;
    shortcutKeys?: string[];
    /** Row density. `md` is upstream's; `sm` matches this app's compact controls. */
    size?: "sm" | "md";
}
interface CommandDropdownMenuItemDefaultType extends CommandMenuItemBaseType {
    type?: "default";
}
interface CommandDropdownMenuItemIconType extends CommandMenuItemBaseType {
    type: "icon";
    icon: FC<{
        className?: string;
    }>;
}
interface CommandDropdownMenuItemAvatarType extends CommandMenuItemBaseType {
    type: "avatar";
    src: string;
    alt: string;
}
interface CommandDropdownMenuItemDotType extends CommandMenuItemBaseType {
    type: "dot";
    dotColor: "green";
}
export type CommandDropdownMenuItemType = CommandDropdownMenuItemDefaultType | CommandDropdownMenuItemIconType | CommandDropdownMenuItemAvatarType | CommandDropdownMenuItemDotType;
export type CommandDropdownMenuItemProps = CommandDropdownMenuItemType & ListBoxItemProps;
export declare const CommandDropdownMenuItem: ({ label, children, description, stacked, shortcutKeys, className, size, ...props }: CommandDropdownMenuItemProps) => import("react").JSX.Element;
export {};
