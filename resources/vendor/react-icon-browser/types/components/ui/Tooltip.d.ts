import type { DOMAttributes, ReactElement, ReactNode } from 'react';
import type { FocusableElement } from '@react-types/shared';
/**
 * Tooltip — the app's tooltip, on Untitled UI.
 *
 * The call-site API (`content`, `side`, `shortcut`) is deliberately unchanged, so
 * swapping the implementation stayed a one-file job across 14 triggers rather than a
 * 14-file rewrite. Same reason `Glyph` keeps its own name vocabulary.
 *
 * Two things the design system does differently, both improvements:
 *
 * `shortcut` maps onto its `description` slot instead of an inline `<kbd>`. Untitled UI
 * lays title and description out as two lines, which is what a keyboard hint wants -- the
 * old inline badge competed with the label for a 260px bubble and wrapped awkwardly on the
 * longer ones. Mono styling is kept so a shortcut still reads as a key.
 *
 * The trigger is wrapped in react-aria's `Focusable`. `TooltipTrigger` needs a child that
 * accepts hover and focus props, and every call site passes a plain styled `<button>`;
 * `Focusable` adapts an arbitrary DOM element without forcing all 14 to become react-aria
 * `Button`s, which would bring their own styling and lose `iconBtn()`.
 */
export declare function TooltipProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function Tooltip({ content, children, side, shortcut, }: {
    content: ReactNode;
    /**
     * A single DOM element that can take focus -- a `<button>` or `<a>`, not a component.
     * The old implementation had the same requirement and stated it only in a comment;
     * typing it here means a wrong trigger is a compile error instead of a tooltip that
     * silently never opens.
     */
    children: ReactElement<DOMAttributes<FocusableElement>, string>;
    side?: 'top' | 'bottom' | 'left' | 'right';
    shortcut?: string;
}): import("react").JSX.Element;
