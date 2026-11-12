import type { DOMAttributes, ReactElement, ReactNode } from 'react';
import type { FocusableElement } from '@react-types/shared';
import { Focusable } from 'react-aria-components';

import { Tooltip as UuiTooltip } from '@/components/base/tooltip/tooltip';

/**
 * Tooltip — the app's tooltip, on Untitled UI.
 *
 * The call-site API (`content`, `side`, `shortcut`) is deliberately unchanged, so
 * swapping the implementation stayed a one-file job across 14 triggers rather than a
 * 14-file rewrite. Same reason `Glyph` keeps its own name vocabulary.
 *
 * Two things the design system does differently, both improvements:
 *
 * `shortcut` renders as a key chip on the label's line. It used the design system's
 * `description` slot until 2026-10-28, which put a lone letter on a second line under the
 * label and made every hint bubble twice its height (Sim: "badly styled"). The labels are
 * short and the bubble is `max-w-xs`, so one line holds both.
 *
 * Tooltips do not animate out. Adjacent triggers (a tile's copy, favourite and collection
 * buttons) hand the tooltip over instantly, and an exit animation left the previous bubble
 * fading beside the new one.
 *
 * The trigger is wrapped in react-aria's `Focusable`. `TooltipTrigger` needs a child that
 * accepts hover and focus props, and every call site passes a plain styled `<button>`;
 * `Focusable` adapts an arbitrary DOM element without forcing all 14 to become react-aria
 * `Button`s, which would bring their own styling and lose `iconBtn()`.
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  /*
   * A no-op passthrough, kept deliberately.
   *
   * Radix needed a provider to share the open/close delay between triggers; react-aria
   * carries the delay on each trigger instead, so there is nothing to provide. Keeping the
   * component means the mount path in `IchavaBrowser` does not churn, and a future global
   * delay still has somewhere to live.
   */
  return <>{children}</>;
}

export function Tooltip({
  content,
  children,
  side = 'bottom',
  shortcut,
}: {
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
}) {
  // An empty tooltip renders its trigger untouched rather than an empty bubble.
  if (!content) return children;

  // A `disabled` button cannot take focus, and Focusable warns about exactly that in
  // development ("<Focusable> child must be focusable", FINDINGS B10 -- the pager's
  // previous/next buttons on the first and last page). Telling Focusable the trigger is
  // disabled is the truth, and it is what silences the check.
  const isDisabled = (children.props as { disabled?: boolean }).disabled === true;

  return (
    <UuiTooltip
      title={
        shortcut ? (
          <span className="flex items-center gap-2">
            <span>{content}</span>
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[11px] leading-[18px] font-medium text-tooltip-supporting-text">
              {shortcut}
            </kbd>
          </span>
        ) : (
          content
        )
      }
      placement={side}
      arrow
      delay={350}
      exitAnimation={false}
    >
      <Focusable isDisabled={isDisabled}>{children}</Focusable>
    </UuiTooltip>
  );
}
