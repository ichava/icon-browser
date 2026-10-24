import type { ComponentPropsWithRef, ReactNode } from "react";
import type { AutocompleteProps, DialogTriggerProps, Key, ListBoxProps, ListBoxSectionProps, ModalOverlayProps } from "react-aria-components";
import { Collection as AriaCollection, DialogTrigger as AriaDialogTrigger } from "react-aria-components";
import { CommandMenuFooter } from "./base-components/command-menu-footer";
import { CommandDropdownMenuItem, type CommandDropdownMenuItemProps } from "./base-components/command-menu-item";
export type CommandMenuGroupType = {
    id: string;
    title?: string;
    items: CommandDropdownMenuItemProps[];
};
interface CommandMenuRootProps extends Omit<ListBoxProps<CommandMenuGroupType>, "children" | "selectedKeys" | "className">, Omit<AutocompleteProps, "filter">, DialogTriggerProps {
    /** Placeholder text for the search input at the top of the dialog. */
    placeholder?: string;
    /** Content rendered in place of the list when the search matches no items. */
    emptyState?: ReactNode;
    /** Class name applied to the modal panel — the rounded, elevated box that holds the input, list and footer. */
    dialogClassName?: ModalOverlayProps["className"];
    /** Class name applied to the full-screen blurred backdrop behind the modal panel. */
    overlayClassName?: ModalOverlayProps["className"];
    /** Groups of items rendered in the list. They are also flattened so that any item `shortcutKeys` can be registered as global hotkeys. */
    items?: CommandMenuGroupType[];
    /** Groups used to seed the list when `items` is not provided. Their `shortcutKeys` are registered as global hotkeys either way. */
    defaultItems?: CommandMenuGroupType[];
    /** Collation sensitivity passed to React Aria's `useFilter`, controlling how loosely search text matches — `base` ignores case and accents, `variant` matches exactly. */
    sensitivity?: "base" | "accent" | "case" | "variant" | undefined;
    /** Keyboard shortcut that focuses the search input, written as a display string such as `⌘/`. Each character is one key of the combination, and the string is also shown as a hint inside the input. Pass `null` for no shortcut. */
    shortcut?: string | null;
    /** Custom match function for the underlying Autocomplete. Defaults to a `contains` match built from `sensitivity`; pass `false` to skip client-side filtering entirely and show `items` as given. */
    filter?: false | AutocompleteProps["filter"];
    /** Accessible name of the dialog. */
    dialogLabel?: string;
    /** Accessible name of the search input. */
    inputLabel?: string;
    /** Accessible name of the results listbox. */
    listLabel?: string;
}
declare const CommandMenuRoot: ({ items, children, dialogClassName, overlayClassName, filter, inputValue, defaultItems, onInputChange, onSelectionChange, sensitivity, placeholder, defaultSelectedKeys, shortcut, dialogLabel, inputLabel, listLabel, ...otherProps }: CommandMenuRootProps) => import("react").JSX.Element;
interface CommandMenuProps extends ModalOverlayProps {
    /** Accessible name of the dialog. */
    "aria-label"?: string;
    /** Class name applied to the modal panel inside the overlay. The backdrop itself is styled with `className`. */
    dialogClassName?: ModalOverlayProps["className"];
}
export declare const CommandDialog: ({ className, dialogClassName, children, "aria-label": label, ...comboboxProps }: CommandMenuProps) => import("react").JSX.Element;
type CommandMenuListProps = Omit<ListBoxProps<CommandMenuGroupType>, "items">;
export declare const CommandMenuList: ({ className, selectionMode, ...props }: CommandMenuListProps) => import("react").JSX.Element;
interface CommandMenuSectionProps extends ListBoxSectionProps<CommandDropdownMenuItemProps> {
    /** Heading rendered above the section's items. When omitted, the section renders without a header. */
    title?: string;
}
export declare const CommandMenuSection: ({ title, children, items, ...props }: CommandMenuSectionProps) => import("react").JSX.Element;
interface PreviewChildrenProps {
    /**
     * The unique identifier (`Key`) of the selected item.
     */
    selectedId: Key;
}
interface CommandMenuPreviewProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
    /** Whether to render the children directly instead of wrapping them in a `div` that receives the remaining props. */
    asChild?: boolean;
    /** Preview content for the highlighted item. When a function, it is called with the selected item's key; nothing renders while no item is selected. */
    children: ({ selectedId }: PreviewChildrenProps) => ReactNode | ReactNode;
}
export declare const CommandMenuPreview: ({ children, asChild, ...props }: CommandMenuPreviewProps) => import("react").JSX.Element | null;
export declare const CommandMenuGroup: ({ className, ...props }: ComponentPropsWithRef<"div">) => import("react").JSX.Element;
declare const CommandMenu: typeof CommandMenuRoot & {
    Item: typeof CommandDropdownMenuItem;
    List: typeof CommandMenuList;
    Group: typeof CommandMenuGroup;
    Footer: typeof CommandMenuFooter;
    Preview: typeof CommandMenuPreview;
    Section: typeof CommandMenuSection;
    Trigger: typeof AriaDialogTrigger;
    Collection: typeof AriaCollection;
};
export { CommandMenu };
