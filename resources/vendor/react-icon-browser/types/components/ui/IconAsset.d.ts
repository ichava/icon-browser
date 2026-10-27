import type { Icon } from '@ichava/js-ui-kernel';
/**
 * IconAsset — renders a catalog icon, honoring the live preview color, treatment
 * and grid stroke (plan §B). Three paths, decided per icon:
 *   own-colour → image (untouched)
 *   stroke slider moved → INLINE svg with the exact stroke-width rewritten
 *   otherwise → fast CSS mask + treatment styling
 */
export declare function IconAsset({ icon, size, color, stroke, inline }: {
    icon: Icon;
    size: number;
    color?: string | null;
    stroke?: number;
    inline?: boolean;
}): import("react").JSX.Element;
