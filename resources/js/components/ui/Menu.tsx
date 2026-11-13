import type { ReactElement, ReactNode } from 'react';
import type { PopoverProps as AriaPopoverProps } from 'react-aria-components';
import { Pressable } from 'react-aria-components';

import { Dropdown } from '@/components/base/dropdown/dropdown';
import { CARET_CORNER_CLEARANCE, CARET_HEIGHT } from '@/components/ui/caretGeometry';
import { PopoverCaret } from '@/components/ui/PopoverCaret';
import { cx } from '@ichava/js-ui-kernel/react';

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
export function MenuPopover({
  align = 'left',
  width,
  className,
  children,
  ...props
}: Omit<AriaPopoverProps, 'children' | 'className'> & {
  align?: 'left' | 'right';
  width?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Dropdown.Popover
      placement={`bottom ${align === 'right' ? 'end' : 'start'}` as never}
      // The ring sits outside the box, so the caret shows its full height above it: 1px of
      // air past that, as in `Popover`.
      offset={CARET_HEIGHT + 1}
      arrowBoundaryOffset={CARET_CORNER_CLEARANCE}
      containerPadding={8}
      /*
       * Non-modal, like the app's popovers (Popover.tsx): a modal menu locks the page's
       * scroll, which on a scrolling host page hides its scrollbar and shifts the page
       * (Sim, 2026-10-27), and marks the trigger inert, which broke the trigger's tooltip.
       * Escape and an outside press still close it, and focus still returns to the trigger.
       */
      isNonModal
      {...props}
      /*
       * `overflow-visible`: the dropdown's own `overflow-auto` clipped anything outside the
       * panel, which is where the caret sits -- the reason the menus had none. The menu
       * inside scrolls instead (`MENU_CLASS`), so a long list still stops at 72vh.
       */
      className={cx('z-(--z-popover) w-auto min-w-36 overflow-visible bg-[var(--pop)] shadow-[var(--shadow-elevated)] ring-[var(--border)]', className)}
      style={{ width, fontSize: 'var(--app-font, 13.5px)', borderRadius: 'min(calc(var(--radius) + 2px), 10px)' }}
    >
      <PopoverCaret edge="ring" />
      {children}
    </Dropdown.Popover>
  );
}

/** Item text at the app's density; upstream's `text-sm font-semibold` is a size up. */
export const MenuText = ({ children, className, ...rest }: { children: ReactNode; className?: string; dir?: 'ltr' | 'rtl' }) => (
  <span {...rest} className={cx('text-[12.5px] font-medium', className)}>
    {children}
  </span>
);

/**
 * The menu's own classes: `ich-pop` is a test and positioning hook. The menu is the scroller
 * (`max-h-[72vh]`), because its popover no longer clips so that the caret can show.
 */
export const MENU_CLASS = 'ich-pop max-h-[72vh] p-0.5';

/**
 * Menu -- a plain action menu (the detail dialog's download menu). The public API is
 * unchanged by the move onto `Dropdown`.
 *
 * `Pressable` wraps the trigger for the same reason as in `Popover` and `Tooltip`: the
 * call sites pass plain styled `<button>`s, and adapting them beats rewriting each one as
 * a react-aria `Button` and losing its styling.
 */
export function Menu({
  trigger,
  items,
  align = 'left',
  label = 'Menu',
}: {
  trigger: ReactElement;
  items: { id: string; label: ReactNode; onAction: () => void; danger?: boolean }[];
  align?: 'left' | 'right';
  label?: string;
}) {
  return (
    <Dropdown.Root>
      <Pressable>{trigger as never}</Pressable>
      <MenuPopover align={align}>
        <Dropdown.Menu aria-label={label} className={MENU_CLASS}>
          {items.map((item) => (
            <Dropdown.Item key={item.id} id={item.id} onAction={item.onAction} textValue={typeof item.label === 'string' ? item.label : item.id}>
              <MenuText className={item.danger ? 'text-[var(--danger)]' : undefined}>{item.label}</MenuText>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </MenuPopover>
    </Dropdown.Root>
  );
}
