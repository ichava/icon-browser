import type { ReactElement, ReactNode } from 'react';
import type { PopoverProps as AriaPopoverProps } from 'react-aria-components';
/**
 * Menus on Untitled UI's `Dropdown` (free, `base/dropdown`), inventory #17, #23, #32, #39.
 *
 * A menu rather than a popover full of buttons, because the semantics differ and screen
 * readers act on them: `role="menu"` announces an item count, arrows move, Home/End jump,
 * typeahead selects and Escape returns focus to the trigger. The language, help and account
 * menus were popovers of buttons (the language one declared `role="menu"` with none of the
 * keyboard model behind it).
 *
 * `MenuPopover` is the dropdown's popover with this app's surface: `--pop` rather than
 * `bg-primary` (which is the canvas colour in dark), the app's z-index layer, and its base
 * font, since the popover portals to <body>. `ich-pop` stays on the menu: `theme.css` and
 * the specs select panels by it.
 */
export declare function MenuPopover({ align, width, className, children, ...props }: Omit<AriaPopoverProps, 'children' | 'className'> & {
    align?: 'left' | 'right';
    width?: number;
    className?: string;
    children: ReactNode;
}): import("react").JSX.Element;
/** Item text at the app's density; upstream's `text-sm font-semibold` is a size up. */
export declare const MenuText: ({ children, className, ...rest }: {
    children: ReactNode;
    className?: string;
    dir?: 'ltr' | 'rtl';
}) => import("react").JSX.Element;
/** The menu's own classes: `ich-pop` is a test and positioning hook. */
export declare const MENU_CLASS = "ich-pop p-0.5";
/**
 * Menu -- a plain action menu (the detail dialog's download menu). The public API is
 * unchanged by the move onto `Dropdown`.
 *
 * `Pressable` wraps the trigger for the same reason as in `Popover` and `Tooltip`: the
 * call sites pass plain styled `<button>`s, and adapting them beats rewriting each one as
 * a react-aria `Button` and losing its styling.
 */
export declare function Menu({ trigger, items, align, label, }: {
    trigger: ReactElement;
    items: {
        id: string;
        label: ReactNode;
        onAction: () => void;
        danger?: boolean;
    }[];
    align?: 'left' | 'right';
    label?: string;
}): import("react").JSX.Element;
