/**
 * A framework-agnostic inline-style object.
 *
 * `core/` must not import React, not even a type: `CSSProperties` in a return
 * type puts React into the public surface that a Vue or Blade consumer would
 * inherit. This is the plain equivalent. React accepts it when spread
 * (`style={{ ...styleObject }}`), Vue's `:style` binds it directly, and a Blade
 * serializer can walk it.
 *
 * Keys are camelCase CSS properties or `--custom-property` names; both are
 * string-keyed, which is why this is not narrowed further.
 */
export type StyleObject = Record<string, string | number | undefined>;
export type { Icon, IconId, IconPackage, RawIcon, Term, Filters, PageMeta, PageResult, Envelope } from '@ichava/js-ui-kernel';
export type { Catalog, CategoryGroup, CategoryNode, SubNode } from '../modules/catalog/domain/CatalogIndex';
export type { ListParams } from './api/ApiClient';
export type ViewMode = 'grid' | 'list';
/** Moved to the catalog module with the query they describe; same types. */
export type { SortKey, SortOrder } from '../modules/catalog/domain/IconQuery';
export type Theme = 'light' | 'dark';
export type SizeUnit = 'px' | 'rem' | 'em';
export type CopyFormat = 'svg' | 'helper' | 'blade' | 'vue' | 'react' | 'name';
/**
 * The icon dialog's snippet tabs, as a host configures them (`config.snippets`; on Laravel,
 * `config('ichava.icon-browser.snippets')`). Every key is optional in a host's config.
 *
 * A template is a string with `{{token}}` placeholders (see `snippetTokens()` for the
 * list). Only a bare word is a token, so Blade's own `{{ $var }}` and `{{ ichava(...) }}`
 * pass through untouched, and an unknown token is left as written rather than erased.
 */
export interface SnippetConfig {
    /** The tabs to show, in order: built-in format ids and the ids of `templates`. */
    tabs: string[];
    /** Tab labels by id. A label here wins over the built-in (translated) one. */
    labels: Record<string, string>;
    /** Templates by id: replaces a built-in format, or adds a new one when listed in `tabs`. */
    templates: Record<string, string>;
    /** The class the Blade, helper, Livewire and Alpine snippets put on the icon. */
    className: string;
    /** Origin for the API tab's absolute URL; the page's own origin when empty. */
    apiOrigin: string;
    /**
     * The API tab's SVG route for an icon that carries no `svg_url`, as a template with
     * `{iconId}`: a REST host's `icons.svg` from its bootstrap map (`hostConfig` sets it).
     * `/ichava/api/v1/icons/{iconId}/svg` when unset.
     */
    svgEndpoint?: string;
}
export type Treatment = 'default' | 'solid' | 'duotone' | 'midtone' | 'halftone';
/** Icon-label scale (drives base font size). XS added for full appearance parity. */
export type Scale = 'xs' | 's' | 'm' | 'l';
export type Density = 'compact' | 'comfy';
/** How a given icon should be painted — the one decision the fidelity engine makes. */
export type RenderStrategy = {
    kind: 'image';
    url: string;
} | {
    kind: 'mask';
    url: string;
    color: string;
};
