// Untitled UI React PRO, used under licence; see LICENSE
//
// Local adaptations, kept small so `untitledui upgrade` stays a readable diff:
//   - react-hotkeys-hook is not used. Item `shortcutKeys` are display only; the app's
//     own `useShortcuts` already owns those keys, and registering them twice would run
//     every action twice. `parseHotkeys.ts` was therefore not vendored.
//   - `dialogLabel`, `inputLabel` and `listLabel` replace the hard-coded English
//     "Command menu", "Search" and "Command menu results", so all seven locales apply.
//   - The input is `role="combobox"` with `aria-expanded`: the APG name for an input
//     that owns a listbox through aria-activedescendant, and what the e2e and axe
//     tests look the palette up by.
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Children, Fragment, createContext, useContext, useMemo, useRef, useState } from "react";
import type { AutocompleteProps, DialogTriggerProps, Key, ListBoxProps, ListBoxSectionProps, ModalOverlayProps } from "react-aria-components";
import {
    Autocomplete as AriaAutocomplete,
    Collection as AriaCollection,
    Dialog as AriaDialog,
    DialogTrigger as AriaDialogTrigger,
    ListBox as AriaListBox,
    ListBoxSection as AriaListBoxSection,
    Modal as AriaModal,
    ModalOverlay as AriaModalOverlay,
    TextField as AriaTextField,
    useFilter,
} from "react-aria-components";
import { cx } from "@ichava/js-ui-kernel/react";
import { CommandInput } from "./base-components/command-input";
import { CommandMenuFooter } from "./base-components/command-menu-footer";
import { CommandMenuHeader } from "./base-components/command-menu-header";
import { CommandDropdownMenuItem, type CommandDropdownMenuItemProps } from "./base-components/command-menu-item";

export type CommandMenuGroupType = { id: string; title?: string; items: CommandDropdownMenuItemProps[] };

interface CommandMenuContextType extends Omit<CommandMenuRootProps, "children" | "dialogLabel" | "inputLabel"> {
    /**
     * Whether the command menu has a footer. Used for
     * adding an extra bottom padding to the list to account
     * for the absolutely positioned footer at the bottom.
     */
    hasFooter?: boolean;
    /**
     * The flattened items of the command menu.
     */
    flatItems: CommandDropdownMenuItemProps[];
    /**
     * The currently selected keys.
     */
    selectedKeys: Iterable<Key>;
    /**
     * The function to set the currently selected keys.
     */
    setSelectedKeys: (keys: Iterable<Key>) => void;
}

const CommandMenuContext = createContext<CommandMenuContextType>({
    hasFooter: false,
    flatItems: [],
    selectedKeys: new Set(),
    setSelectedKeys: () => {},
});

interface CommandMenuRootProps
    extends Omit<ListBoxProps<CommandMenuGroupType>, "children" | "selectedKeys" | "className">, Omit<AutocompleteProps, "filter">, DialogTriggerProps {
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

const CommandMenuRoot = ({
    items,
    children,
    dialogClassName,
    overlayClassName,
    filter,
    inputValue,
    defaultItems,
    onInputChange,
    onSelectionChange,
    sensitivity = "base",
    placeholder = "Search",
    defaultSelectedKeys,
    shortcut = "⌘/",
    dialogLabel = "Command menu",
    inputLabel = "Search",
    listLabel = "Command menu results",
    ...otherProps
}: CommandMenuRootProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { contains } = useFilter({ sensitivity });

    const [selectedKeys, setSelectedKeys] = useState<Iterable<Key>>(defaultSelectedKeys ?? new Set());

    // The collection the list renders. Left undefined when neither prop is given
    // so the list falls back to whatever static children were passed instead.
    const collection = items ?? defaultItems;

    // Flatten the items. Upstream also registers each item's `shortcutKeys` as a global
    // hotkey here; see the note at the top of this file for why that is not done.
    const flatItems = (collection ?? []).reduce<CommandDropdownMenuItemProps[]>((acc, group) => [...acc, ...group.items], []);

    // Determine if the command menu has a footer.
    const hasFooter = useMemo(() => {
        let hasFooter = false;

        Children.forEach(children, (child) => {
            if (child && typeof child === "object" && "type" in child && child.type === CommandMenuFooter) {
                hasFooter = true;
            }
        });

        return hasFooter;
    }, [children]);

    return (
        <CommandMenuContext.Provider value={{ hasFooter, flatItems, selectedKeys, setSelectedKeys, onSelectionChange, items: collection, listLabel, ...otherProps }}>
            <CommandDialog aria-label={dialogLabel} isOpen={otherProps.isOpen} onOpenChange={otherProps.onOpenChange} className={overlayClassName} dialogClassName={dialogClassName}>
                <AriaAutocomplete {...{ inputValue, onInputChange }} filter={filter === false ? undefined : filter || contains}>
                    <AriaTextField aria-label={inputLabel}>
                        <CommandInput
                            autoFocus
                            role="combobox"
                            aria-expanded
                            shortcutKeys={shortcut ? [shortcut] : undefined}
                            placeholder={placeholder}
                            ref={inputRef}
                            className="relative outline-hidden! after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-border-secondary"
                        />
                    </AriaTextField>
                    {children}
                </AriaAutocomplete>
            </CommandDialog>
        </CommandMenuContext.Provider>
    );
};

interface CommandMenuProps extends ModalOverlayProps {
    /** Accessible name of the dialog. */
    "aria-label"?: string;
    /** Class name applied to the modal panel inside the overlay. The backdrop itself is styled with `className`. */
    dialogClassName?: ModalOverlayProps["className"];
}

export const CommandDialog = ({ className, dialogClassName, children, "aria-label": label = "Command menu", ...comboboxProps }: CommandMenuProps) => {
    return (
        <AriaModalOverlay
            {...comboboxProps}
            isDismissable
            className={(state) =>
                cx(
                    "fixed inset-0 z-50 flex min-h-full items-start justify-center overflow-y-auto bg-overlay/70 p-4 text-center md:pt-16 xl:pt-[clamp(64px,10vh,243px)]",
                    state.isEntering && "duration-300 ease-out animate-in fade-in",
                    state.isExiting && "duration-200 ease-in animate-out fade-out",
                    typeof className === "function" ? className(state) : className,
                )
            }
        >
            {(state) => (
                <AriaModal
                    className={(state) =>
                        cx(
                            "flex max-h-full w-160 flex-col overflow-hidden rounded-xl bg-primary text-left align-middle shadow-xl",
                            state.isEntering && "duration-300 ease-out animate-in zoom-in-95",
                            state.isExiting && "duration-200 ease-in animate-out zoom-out-95",
                            typeof dialogClassName === "function" ? dialogClassName(state) : dialogClassName,
                        )
                    }
                >
                    <AriaDialog aria-label={label} className="relative flex min-h-0 flex-1 flex-col outline-hidden">
                        {typeof children === "function" ? children(state) : children}
                    </AriaDialog>
                </AriaModal>
            )}
        </AriaModalOverlay>
    );
};

type CommandMenuListProps = Omit<ListBoxProps<CommandMenuGroupType>, "items">;

export const CommandMenuList = ({ className, selectionMode = "single", ...props }: CommandMenuListProps) => {
    const { hasFooter, emptyState, listLabel, ...listBoxProps } = useContext(CommandMenuContext);

    return (
        <AriaListBox
            aria-label={listLabel}
            {...props}
            {...listBoxProps}
            renderEmptyState={() => emptyState}
            selectionMode={selectionMode}
            onSelectionChange={(key) => {
                listBoxProps.onSelectionChange?.(key as Set<Key>);
                listBoxProps.setSelectedKeys(key as Set<Key>);
            }}
            className={(state) =>
                cx(
                    "flex max-h-106 flex-1 scroll-py-10 flex-col gap-2 overflow-auto focus:outline-hidden",
                    hasFooter && "scroll-pb-22 pb-13",
                    !state.isEmpty && "pt-2",
                    typeof className === "function" ? className(state) : className,
                )
            }
        />
    );
};

interface CommandMenuSectionProps extends ListBoxSectionProps<CommandDropdownMenuItemProps> {
    /** Heading rendered above the section's items. When omitted, the section renders without a header. */
    title?: string;
}

export const CommandMenuSection = ({ title, children, items, ...props }: CommandMenuSectionProps) => {
    return (
        <AriaListBoxSection {...props} className={cx("border-b border-secondary pb-2 last:border-transparent", props.className)}>
            {title && (
                <CommandMenuHeader key={title} className="pb-1">
                    {title}
                </CommandMenuHeader>
            )}
            <AriaCollection items={items}>{children}</AriaCollection>
        </AriaListBoxSection>
    );
};

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

export const CommandMenuPreview = ({ children, asChild, ...props }: CommandMenuPreviewProps) => {
    const { selectedKeys } = useContext(CommandMenuContext);

    const keys = Array.from(selectedKeys);
    if (!keys.length) return null;

    const selectedId = keys.at(0) as Key;

    if (asChild) {
        return <Fragment>{typeof children === "function" ? children({ selectedId }) : children}</Fragment>;
    }

    return <div {...props}>{typeof children === "function" ? children({ selectedId }) : children}</div>;
};

export const CommandMenuGroup = ({ className, ...props }: ComponentPropsWithRef<"div">) => {
    return <div {...props} className={cx("min-h-0 flex-1", className)} />;
};

const CommandMenu = CommandMenuRoot as typeof CommandMenuRoot & {
    Item: typeof CommandDropdownMenuItem;
    List: typeof CommandMenuList;
    Group: typeof CommandMenuGroup;
    Footer: typeof CommandMenuFooter;
    Preview: typeof CommandMenuPreview;
    Section: typeof CommandMenuSection;
    Trigger: typeof AriaDialogTrigger;
    Collection: typeof AriaCollection;
};

CommandMenu.Item = CommandDropdownMenuItem;
CommandMenu.List = CommandMenuList;
CommandMenu.Group = CommandMenuGroup;
CommandMenu.Footer = CommandMenuFooter;
CommandMenu.Preview = CommandMenuPreview;
CommandMenu.Section = CommandMenuSection;
CommandMenu.Trigger = AriaDialogTrigger;
CommandMenu.Collection = AriaCollection;

export { CommandMenu };
