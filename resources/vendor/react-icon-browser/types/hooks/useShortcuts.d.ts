import { type RefObject } from 'react';
export interface ShortcutScope {
    /** The mount owns the page, so keys pressed with nothing focused are its too. */
    manageDocument?: boolean;
    /** The component root and the overlay container: keys pressed inside either are ours. */
    rootRef?: RefObject<HTMLElement | null>;
    overlayRef?: RefObject<HTMLElement | null>;
}
/**
 * Platform-aware keyboard shortcuts:
 * ⌘K palette · ⌘T theme · ⌘, settings · ⌘1/2/3 library tabs · ⇧⌘⌫ reset filters · Esc closes.
 * Grid keys (F favorite / C copy / X select) are handled on the focused tile.
 *
 * The listener sits on `document`, but a key only counts when it happens inside this
 * mount -- its root or its overlay container -- or, for the standalone page
 * (`manageDocument`), with nothing focused (A6-gaps G3). It used to take every key on the
 * page: two mounts both opened a palette on one ⌘K, and an embed captured the host's `/`,
 * ⌘A and Esc. A hook called without a scope keeps the old document-wide behaviour.
 *
 * Reset filters used to be ⌘R, which `preventDefault`ed the browser's reload (G4). It is
 * ⇧⌘⌫ now; the toolbar's reset button is unchanged.
 */
export declare function useShortcuts(scope?: ShortcutScope): void;
