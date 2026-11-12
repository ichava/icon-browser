import { OverlayArrow } from 'react-aria-components';

import { caretGeometry, type CaretEdge } from './caretGeometry';

/**
 * PopoverCaret -- the one caret every anchored dropdown and popover draws.
 *
 * It replaces an inline triangle in `Popover` that went wrong three ways: it was filled
 * with `--pop` and had no outline, so in light the panel's border ran straight under it
 * and it read as a notch rather than part of the panel; it sat outside the border instead
 * of over it, leaving a hairline between caret and panel; and it relied on a
 * `group-placement-top:` variant whose `group` class nothing set, so a panel that flipped
 * above its trigger kept a caret pointing up into it. The menus (`MenuPopover`) drew none.
 *
 * react-aria positions it: `OverlayArrow` sits on the panel's edge facing the trigger and
 * is moved along that edge to the trigger's centre, and it follows a flip. Colours are the
 * panel's own tokens (`--pop`, `--border`), so it matches in light and dark without a
 * theme branch.
 */
export function PopoverCaret({ edge = 'border' }: { edge?: CaretEdge }) {
  return (
    <OverlayArrow className="pointer-events-none z-1" data-caret="" data-edge={edge}>
      {({ placement }) => {
        const shape = caretGeometry(placement, edge);
        return (
          <svg
            aria-hidden="true"
            focusable="false"
            width={shape.w}
            height={shape.h}
            viewBox={`0 0 ${shape.w} ${shape.h}`}
            className="block overflow-visible"
            style={{ transform: shape.transform }}
          >
            <path d={shape.fill} fill="var(--pop)" />
            <path d={shape.edge} fill="none" stroke="var(--border)" strokeWidth={1} strokeLinejoin="round" />
          </svg>
        );
      }}
    </OverlayArrow>
  );
}
