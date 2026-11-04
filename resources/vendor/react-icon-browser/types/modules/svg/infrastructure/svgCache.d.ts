import type { Icon } from '@ichava/js-ui-kernel';
export interface SvgParts {
    body: string;
    viewBox: string;
    /**
     * The body with black paint rewritten to `currentColor`, when the icon is monochrome
     * black (see core/monochrome). Absent for every other icon. Used by the dark-mode
     * preview so an openmoji-black glyph does not vanish (FINDINGS B7).
     */
    monoBody?: string;
    /**
     * The root `<svg>`'s presentation attributes (fill, stroke and friends), serialised
     * as ` name="value"` pairs. `body` drops the root, so anything that rebuilds a
     * standalone SVG or a `<symbol>` from it needs these too, or an outline icon loses
     * its `fill="none"` and paints solid (A6-gaps G2). Empty when the root has none
     * (a flag paints every shape itself); absent only when no SVG was parsed.
     */
    rootAttrs?: string;
}
/** Fetch (or read inline) an icon's SVG parts, cached by URL. */
export declare function getSvgParts(icon: Icon): SvgParts | Promise<SvgParts>;
