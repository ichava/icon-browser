import type { CSSProperties, FC, SVGProps } from 'react';
type IconComponent = FC<SVGProps<SVGSVGElement> & {
    size?: number;
    color?: string;
}>;
/**
 * Chrome glyph names → `@untitledui/icons` components.
 *
 * The names are the app's own vocabulary and are the stable API: call sites pass
 * `name`, so swapping the underlying icon set is a change to this table alone. That is
 * what made replacing `lucide-react` a one-file job rather than a 110-site rewrite.
 *
 * Every entry here is REACHED. The previous map declared 58 names of which 15 were
 * never referenced -- dead weight that shipped, because the whole map is imported
 * eagerly. Verified by extracting every quoted token from every `name=` attribute and
 * `icon:` field, which matters more than it sounds: a first pass captured only the
 * first token of `name={theme === 'dark' ? 'sun' : 'moon'}` and reported `sun` as
 * unused. A wrongly-dropped glyph does not error, it renders a blank spacer.
 */
export declare const GLYPH: Record<string, IconComponent>;
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
export {};
