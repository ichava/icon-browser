// Untitled UI React PRO, used under licence; see LICENSE
//
// Local adaptation: a `size` prop. Upstream's rows are 40px with 14px type; this app runs
// 30-34px controls and 13.5px base type, so `size="sm"` tightens the row, the icon and
// the type. `md` is upstream unchanged.
//
// Local adaptation: the shortcut keycaps render INSIDE the label slot. The label is the
// option's aria-labelledby target, so upstream's keycaps were visible text missing from
// the accessible name ("Toggle theme" beside a visible "CTRL+T"), which axe reports as
// label-content-name-mismatch (WCAG 2.5.3). The name now carries the shortcut too.
import type { FC } from "react";
import { Text as AriaText, ListBoxItem, type ListBoxItemProps } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { FeaturedIcon } from "@ichava/js-ui-kernel/react";
import { cx } from "@ichava/js-ui-kernel/react";
import { CommandShortcut } from "./command-shortcut";

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
    icon: FC<{ className?: string }>;
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

export type CommandDropdownMenuItemType =
    | CommandDropdownMenuItemDefaultType
    | CommandDropdownMenuItemIconType
    | CommandDropdownMenuItemAvatarType
    | CommandDropdownMenuItemDotType;

// Omit keys from an object
function omit(obj: object, keys: string[]): object {
    const keysToOmit = new Set(keys);
    return Object.fromEntries(Object.entries(obj).filter(([key]) => !keysToOmit.has(key)));
}

export type CommandDropdownMenuItemProps = CommandDropdownMenuItemType & ListBoxItemProps;

export const CommandDropdownMenuItem = ({ label, children, description, stacked, shortcutKeys, className, size = "md", ...props }: CommandDropdownMenuItemProps) => {
    const sm = size === "sm";
    return (
        <ListBoxItem
            {...omit(props, ["type", "icon", "alt", "src"])}
            textValue={label}
            className={(state) => cx("group block cursor-pointer px-2 py-0.5 outline-hidden", typeof className === "function" ? className(state) : className)}
        >
            {(state) => (
                <div
                    className={cx(
                        "relative flex min-h-10 items-center justify-between rounded-lg px-2.5 py-2 pl-2.5 outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover",
                        sm && "min-h-8 rounded-md px-2 py-1 pl-2",
                        state.isSelected && "bg-primary_hover",
                        state.isFocusVisible && "outline-2 outline-offset-2",
                        stacked && "items-start p-2.5 pl-3.5",
                    )}
                >
                    {props.type === "icon" && !stacked && <props.icon className={cx("mr-2 text-fg-quaternary", sm ? "size-4" : "size-5")} />}
                    {props.type === "icon" && stacked && <FeaturedIcon color="gray" size="md" theme="modern" icon={props.icon} className="mr-2" />}

                    {props.type === "avatar" && <Avatar alt={props.alt} src={props.src} size={stacked ? "md" : "xs"} className="mr-2" />}

                    {props.type === "dot" && (
                        <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            className={cx("mr-2 shrink-0 text-fg-success-secondary", stacked && "mt-2 self-start")}
                        >
                            <circle cx="5" cy="5" r="4" fill="currentColor" />
                        </svg>
                    )}

                    <div className={cx("flex flex-1 gap-x-1.5", stacked && "flex-col")}>
                        <AriaText
                            slot="label"
                            className={cx("font-medium text-primary", sm ? "text-[12.5px]" : "text-sm", shortcutKeys && "flex flex-1 items-center justify-between gap-2")}
                        >
                            <span>{typeof children === "function" ? children(state) : children || label}</span>
                            {/* A real space: without it the name and the visible text both
                                read "themeCTRL+T", and axe's token match still fails. */}
                            {shortcutKeys && " "}
                            {shortcutKeys && <CommandShortcut keys={shortcutKeys} size={size} />}
                        </AriaText>
                        {description && (
                            <AriaText slot="description" className={cx("text-tertiary", sm ? "font-mono text-[10.5px]" : "text-sm")}>
                                {description}
                            </AriaText>
                        )}
                    </div>

                </div>
            )}
        </ListBoxItem>
    );
};
