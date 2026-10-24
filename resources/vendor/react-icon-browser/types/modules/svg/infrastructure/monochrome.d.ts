/**
 * Let a monochrome icon that hard-codes black follow the text colour (FINDINGS B7).
 *
 * The browser-side twin of core's opt-in `ConvertsMonochromeToCurrentColor` pass
 * (ichava/core#114). An icon drawn as `fill="#000"` renders black whatever the page
 * does, so on a dark background it vanishes -- openmoji-black's coconut and
 * deaf-woman are the cases the audit saw. Rewriting that black to `currentColor`
 * makes it inherit the surrounding `color`.
 *
 * The rules are core's, deliberately, so a static catalog and a REST catalog with the
 * flag on paint the same icon the same way:
 *
 *  - Only safe when EVERY paint is black or neutral. In a multicolour icon the black
 *    is part of the drawing, so any other colour, any `url(...)` (gradient, pattern)
 *    returns the input untouched.
 *  - A `<style>` element returns it untouched too: its selectors are not evaluated.
 *  - Only explicit black is rewritten. An unpainted element also renders black by
 *    default; adding paint to it is a different, broader change.
 *
 * Pure apart from `DOMParser`/`XMLSerializer`, which every browser and jsdom provide.
 * Returns the input unchanged when it cannot be parsed or nothing applies.
 */
/** True when every paint in `svg` is black or neutral and at least one is black. */
export declare function isMonochromeBlack(svg: string): boolean;
/** Rewrite pure-black paint to `currentColor` when the icon is monochrome; else return it unchanged. */
export declare function monochromeToCurrentColor(svg: string): string;
