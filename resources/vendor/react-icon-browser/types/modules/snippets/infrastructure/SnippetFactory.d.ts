import type { Icon } from '@ichava/js-ui-kernel';
import type { SnippetConfig } from '../../../core/types';
/** The formats the browser builds itself. */
export declare const BUILTIN_SNIPPET_FORMATS: readonly ['svg', 'motion', 'helper', 'blade', 'bladeGeneric', 'livewire', 'alpine', 'vue', 'react', 'svelte', 'webcomponent', 'api', 'name'];
export type BuiltinSnippetFormat = (typeof BUILTIN_SNIPPET_FORMATS)[number];
/** A built-in format, or any id a host adds through `config.snippets.templates` or `register()`. */
export type SnippetFormat = BuiltinSnippetFormat | (string & {});
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
    /** Origin for the API tab; overrides `config.apiOrigin`. */
    baseUrl?: string;
    motion?: SnippetMotion;
    /** The host's snippet configuration (`config.snippets`). */
    config?: Partial<SnippetConfig> | null;
}
/** What a registered builder receives: the icon, the options, and every template token. */
export interface SnippetContext {
    icon: Icon;
    options: SnippetOptions;
    tokens: Record<string, string>;
}
export type SnippetBuilder = (ctx: SnippetContext) => string;
/** Detail-dialog tabs, in their default order. A host reorders or trims them with `config.snippets.tabs`. */
export declare const SNIPPET_TABS: {
    id: BuiltinSnippetFormat;
    label: string;
}[];
export declare const DEFAULT_SNIPPET_CLASS = "w-6 h-6";
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
 * SnippetFactory: what each tab of the icon dialog shows, and what a copy puts on the clipboard.
 *
 * Every format resolves the same way, most specific first:
 *
 * 1. a snippet the server rendered for this icon (`icon.snippets[format]`, from Laravel's
 *    `IconResource`);
 * 2. a template the host configured (`config.snippets.templates[format]`);
 * 3. a builder registered with `register()`;
 * 4. the server's legacy per-icon strings (`blade_clean`, `blade_generic`, `helper`);
 * 5. the built-in.
 *
 * Every built-in writes code that runs against what exists: the `ichava()` helper and
 * `<x-ichava::icon>` from ichava/core, the `<x-{pack}-icon>` tag each pack registers, the
 * icon-browser API route, or the icon's own SVG inlined into a component. None of them
 * imports a package that has not been published.
 */
export declare class SnippetFactory {
    #private;
    /** Add or replace a format from JavaScript. Show it by listing its id in `config.snippets.tabs`. */
    register(format: string, builder: SnippetBuilder): this;
    /** Whether `format` can be built: a built-in, a configured template, or a registered builder. */
    supports(format: string, config?: Partial<SnippetConfig> | null): boolean;
    /** Whether building `format` needs the icon's SVG markup (so a copy fetches it first). */
    needsSvg(format: string, config?: Partial<SnippetConfig> | null): boolean;
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
/**
 * The path Laravel resolves for `icon`: the server's `icon_path` when it sent one, else
 * `vendor/package::<variant or category>/<name>`, which is how a one-folder pack lays its
 * files out (tabler's `outline/home`, emoji's `twemoji/1f600`).
 */
export declare function iconPath(icon: Icon): string;
/**
 * Every token a template can use, for `icon` with options `o`. `svg` and `jsx` are only
 * filled when the markup was built (formats that inline the icon).
 */
export declare function snippetTokens(icon: Icon, o: SnippetOptions, svg?: string): Record<string, string>;
/** Fill `{{token}}` placeholders. Only bare words are tokens; anything unknown is left as written. */
export declare function renderTemplate(template: string, tokens: Record<string, string>): string;
/**
 * The tabs the dialog shows for `config`: its `tabs` list in order, keeping the ids this
 * factory can build. Labels come from `config.labels`, then the built-in label, then the id.
 */
export declare function snippetTabs(config?: Partial<SnippetConfig> | null, factory?: SnippetFactory): {
    id: SnippetFormat;
    label: string;
    builtin: boolean;
}[];
/**
 * SVG markup as JSX: attributes camel-cased (`stroke-width` → `strokeWidth`), `class` →
 * `className`, inline `style` as an object, text as string literals, and the props spread
 * on the root. Parsed rather than regex-rewritten, so attribute values are never touched.
 */
export declare function svgToJsx(svg: string): string;
