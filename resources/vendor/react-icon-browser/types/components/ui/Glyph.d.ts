import type { CSSProperties } from 'react';
/**
 * Glyph — a chrome icon from the design system's set.
 *
 * Was `Ui`, backed by `lucide-react`. The name changed with the icon set because the
 * old one said nothing; `Glyph` is what it renders.
 *
 * Unknown names render a same-size spacer rather than throwing, so a typo degrades to
 * a gap instead of a blank screen. It warns in development, and `glyphs.test.ts`
 * fails the build on any static name that has no entry, so the silent path is only
 * reachable for a genuinely dynamic name.
 */
export declare function Glyph({ name, size, color, style, className, }: {
    name: string;
    size?: number;
    color?: string;
    style?: CSSProperties;
    className?: string;
}): import("react").JSX.Element;
/**
 * Mask — a monochrome icon painted via CSS mask over an SVG asset, so it always
 * inherits the surrounding `color`.
 *
 * Distinct from `Glyph` and deliberately kept: this renders arbitrary SVGs from
 * `public/assets/`, which is the icon *catalogue*, not the app's chrome. It has no
 * fixed name vocabulary and no design-system equivalent.
 */
export declare function Mask({ src, size, color, style, }: {
    src: string;
    size?: number;
    color?: string;
    style?: CSSProperties;
}): import("react").JSX.Element;
