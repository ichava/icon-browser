/** The two snippet operations a copy needs. `SnippetFactory` provides both. */
export interface CopySnippets<F extends string, I, P, O> {
    build(format: F, icon: I, o: O): string;
    svgFromParts(icon: I, parts: P, o: O): string;
}
/** Where the SVG parts come from: the parts cache, which may answer synchronously. */
export type SvgPartsSource<I, P> = (icon: I) => P | Promise<P>;
/**
 * The text a copy puts on the clipboard (architecture.md 2.4): for the `svg` format, the
 * real SVG body, fetched through the parts cache so it is never an empty placeholder and
 * multicolour icons keep their fills; for every other format, the snippet. The grid tile
 * and the list view each carried a copy of this; they share it now.
 *
 * The collaborators are passed in, so this stays free of the DOM and the cache.
 */
export declare function copyPayload<F extends string, I, P, O>(icon: I, format: F, o: O, deps: {
    snippets: CopySnippets<F, I, P, O>;
    svgParts: SvgPartsSource<I, P>;
}): Promise<string>;
