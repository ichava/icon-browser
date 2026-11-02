/**
 * Loading skeletons for the icon grid and list (Sim, 2026-10-27: skeletons, not grey
 * blocks). Each placeholder has the shape of what replaces it -- a grid tile is the same
 * card (border, surface, radius, square) with an icon-sized block where the glyph will be;
 * a list row has the icon, name, id and copy button -- so the page does not jump when the
 * icons arrive. One `ich-skeleton` shimmer runs across them; reduced motion stills it.
 */
export declare function IconSkeleton({ view, count }: {
    view: 'grid' | 'list';
    count?: number;
}): import("react").JSX.Element;
