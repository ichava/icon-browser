import { type RefObject } from 'react';
/**
 * This mount's component root, for code that runs in a portalled overlay and needs to
 * reach back into the mount it belongs to (two mounts on one page must not reach into
 * each other's). Provided by `IchavaBrowser`.
 */
export declare const MountRootContext: import("react").Context<RefObject<HTMLElement | null> | null>;
export declare function useMountRoot(): RefObject<HTMLElement | null> | null;
/**
 * After an overlay closes, put focus back inside the mount if it fell to `<body>`.
 *
 * react-aria restores focus to whatever opened the overlay. When that was another
 * overlay that has since unmounted -- the command palette handing off to the detail
 * dialog -- there is nothing to restore to, and focus landed on `<body>` (A6-gaps G6,
 * WCAG 2.4.3). The preferred target is the tile for `iconId`, then the grid's current
 * cell, then the icon filter.
 */
export declare function restoreFocusInto(root: HTMLElement | null | undefined, iconId?: number): void;
