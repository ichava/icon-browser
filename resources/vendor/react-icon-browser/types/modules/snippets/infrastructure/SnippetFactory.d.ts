import type { Icon } from '@ichava/js-ui-kernel';
export type SnippetFormat = 'svg' | 'motion' | 'helper' | 'blade' | 'bladeGeneric' | 'livewire' | 'alpine' | 'vue' | 'react' | 'svelte' | 'webcomponent' | 'api' | 'name';
export interface SnippetMotion {
    id: string;
    label: string;
    keyframes: Keyframe[];
    base: number;
    easing: string;
    easingLabel?: string;
    speed: number;
    direction?: string;
    iterations?: number;
}
export interface SnippetOptions {
    size: number;
    unit: string;
    color: string | null;
    strokeWidth?: number;
    baseUrl?: string;
    motion?: SnippetMotion;
}
/** Detail-dialog tabs. Server-provided formats first (parity), client extras after. */
export declare const SNIPPET_TABS: {
    id: SnippetFormat;
    label: string;
}[];
/**
 * What tells two same-named icons apart within a pack: the variant (tabler `outline` /
 * `filled`, flag `4x3` / `1x1`) or, for packs without variants, the category (emoji
 * `twemoji` / `openmoji-black`). Empty when the pack has neither.
 */
export declare function iconDetail(icon: Icon): string;
/**
 * A short disambiguating label for an icon: pack, then variant or category
 * (`tabler · filled`, `flag · 4x3`). Names repeat across packs and variants -- the
 * fixture alone has camera, bolt, ad and ax twice each -- so the name is not enough.
 */
export declare function iconHint(icon: Icon): string;
/**
 * SnippetFactory — strategy over copy formats. The Laravel `IconResource` already
 * ships `helper`, `blade_clean`, `blade_generic`; those are used verbatim (parity).
 * The rest (Vue/React/Svelte/Web Component/API/SVG/Name) are client enhancements.
 */
export declare class SnippetFactory {
    build(format: SnippetFormat, icon: Icon, o: SnippetOptions, svgBody?: string | null): string;
    /** Emit the selected motion preset as an @ichava/js-motion JSON definition. */
    private motion;
    private svg;
    /**
     * Build a complete, standalone SVG string from parsed parts (inner body +
     * viewBox). Own-colour icons keep their fills; monochrome icons get the chosen
     * colour + stroke. This is the real markup used by copy/download so the default
     * "SVG" format is never an empty placeholder.
     */
    svgFromParts(icon: Icon, parts: {
        body: string;
        viewBox: string;
    }, o: SnippetOptions): string;
}
export declare const snippets: SnippetFactory;
