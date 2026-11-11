import type { IconKind } from '@ichava/js-ui-kernel';
/**
 * Icons | Illustrations: the two top-level kinds of SVG the browser serves.
 *
 * Hidden until there is an illustration to show. Whether there is comes from the data
 * (the kind counts over the other filters), never from a pack name, so it appears on its
 * own once a public illustration set is installed. Stays visible while illustrations are
 * selected, so a filter that empties them still leaves the way back to icons.
 *
 * Switching keeps the search and resets the category, variant, tags and page, which
 * belong to the kind being left (`IconQuery.kind`).
 */
export declare function KindSwitch({ counts }: {
    counts: Record<IconKind, number> | null;
}): import("react").JSX.Element | null;
