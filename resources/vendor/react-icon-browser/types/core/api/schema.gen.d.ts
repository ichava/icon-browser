/** The schema version these types describe (`schemaVersion` in the session and bootstrap documents). */
export declare const PAYLOAD_SCHEMA_VERSION = "1.8.0";
/** The host's signed-in user as presented by core's UserData. Never carries email, password or tokens; extra keys only when the host lists them in ichava.ichava-core.auth.expose. */
export type User = {
    id: string;
    name: string;
    avatarUrl: string | null;
    abilities: Record<string, boolean>;
};
export type Kind = "icon" | "illustration";
/** Which D6 row decided an item's kind. Added in 1.4.0. */
export type KindSource = "host" | "item" | "rule" | "category" | "pack" | "default";
export type KindCounts = {
    icon: number;
    illustration: number;
};
/** The browser's initial kind, the kinds it may show, and unfiltered counts. Added in 1.4.0. */
export type KindsInfo = {
    default: Kind;
    available: Kind[];
    counts: KindCounts;
};
/** Client SVG ceilings, from core's svg.max_elements and svg.max_bytes. Added in 1.4.0. */
export type Limits = {
    svgMaxNodes: number;
    svgMaxChars: number;
};
/** ichava.icon-browser.links.landing; null renders no link. Added in 1.4.0. */
export type CrossLinks = {
    landing: string | null;
};
export type ThemeVariant = {
    svg_url: string | null;
    svg_content?: string | null;
};
/** Code-tab and copy-format ids. The registry is x-ichava-formats at the schema root. Added in 1.4.0; reactNative, angular, solid, preact and astro added in 1.5.0; qwik, ember, elm, css-mask, data-uri, flutter, swiftui and android-vd added in 1.6.0; png-zip removed in 1.7.0; android-vd removed in 1.8.0. */
export type Format = "svg" | "motion" | "helper" | "blade" | "bladeGeneric" | "livewire" | "alpine" | "vue" | "react" | "svelte" | "webcomponent" | "reactNative" | "angular" | "solid" | "preact" | "astro" | "qwik" | "ember" | "elm" | "css-mask" | "data-uri" | "flutter" | "swiftui" | "api" | "name";
/** One icon, as IconResource (REST) and IconSnippets::transform (Inertia) send it. */
export type Icon = {
    id: number;
    package: string;
    name: string;
    kind: Kind;
    kind_source?: KindSource;
    themes: string[];
    /** Theme twins by theme, each with its own SVG URL; [] when there are none. Added in 1.4.0. */
    theme_variants?: Record<string, ThemeVariant> | [];
    category: string | null;
    variant: string | null;
    /** The nested category the icon sits in, below its top-level category: the per-icon counterpart of the subs[] filter. Null at the top level. Added in 1.1.0. */
    sub: string | null;
    path: string;
    icon_path: string;
    file_path: string;
    svg_content: string | null;
    svg_url: string | null;
    viewbox: string | null;
    width: string | number | null;
    height: string | number | null;
    blade_clean: string;
    blade_generic: string;
    helper: string;
    set: string;
};
export type IconResource = Icon & ({
    tags: unknown[];
    keywords: unknown[];
    created_at: string | null;
    updated_at: string | null;
});
export type EmptyReason = "no_match" | "no_icons" | null;
/** GET {prefix}/api/v1/icons. data is the page of iconResource items (with a grouped map beside them). */
export type IconList = {
    data: unknown[] | Record<string, unknown>;
    meta: {
        has_search: boolean;
        has_filters: boolean;
        empty_reason: EmptyReason;
        group_by: string | null;
    };
};
export type Package = {
    name: string;
    label: string;
    count: number;
    description?: string;
    vendor?: string;
    kind?: Kind;
    default?: boolean;
    by_kind?: KindCounts;
};
export type Facet = {
    name: string;
    label?: string;
    count: number;
};
/** One of a pack's variants as the variant picker shows it (core's VariantData): the translated label and description. Added in 1.3.0. */
export type VariantMeta = {
    slug: string;
    label: string;
    description: string;
    default: boolean;
};
/** GET {prefix}/api/v1/icons/filters and the Inertia filterOptions prop; counts are scoped by the other filters. */
export type Filters = {
    packages: Package[];
    categories: unknown[];
    variants: unknown[];
    /** Each pack's variants, keyed by pack name, in display order. PHP sends an empty map as []. Typed in 1.3.0. */
    variants_by_package?: Record<string, VariantMeta[]> | [];
    kinds: Facet[];
    empty?: boolean;
};
export type Statistics = {
    total: {
        icons: number;
        packages: number;
        categories: number;
        variants: number;
    };
    by_kind: {
        icon: number;
        illustration: number;
    };
    empty?: boolean;
    /** Icons per pack and kind; [] when nothing is seeded. Added in 1.4.0. */
    by_package_kind?: Record<string, KindCounts> | [];
};
export type Collection = {
    id: string;
    name: string;
    color?: string | null;
    icon_ids: number[];
    created_at?: string;
};
export type HistoryEntry = {
    icon_id: number;
    action: "view" | "copy" | "download";
    timestamp: string;
};
export type Command = {
    command: string;
    type: "action" | "search" | "navigation";
    metadata?: unknown[] | Record<string, unknown>;
    timestamp: string;
};
/** GET {prefix}/api/v1/library: everything the current owner keeps. */
export type Library = {
    favorites: number[];
    collections: Collection[];
    history: HistoryEntry[];
    commandHistory: Command[];
};
export type Links = {
    login: string | null;
    logout: string | null;
};
/** GET {prefix}/api/v1/session. */
export type Session = {
    schemaVersion: string;
    authenticated: boolean;
    user: User | null;
    tier: "browser" | "session" | "database";
    persistent: boolean;
    links: Links;
};
export type Feature = {
    enabled: boolean;
    reason: "config" | "gate" | "driver" | "empty" | null;
    endpoints: Record<string, string> | unknown[];
};
/** The features manifest: per feature, enabled, why not, and its endpoints. */
export type Features = {
    favorites: Feature;
    collections: Feature;
    history: Feature;
    commands: Feature;
    library: Feature;
    preferences: Feature;
    status: Feature;
    cacheAdmin: Feature;
    illustrations: Feature;
    searchLanguage: Feature;
    export: Feature;
    motion: Feature;
    themeToggle: Feature;
    presence: Feature;
    invites: Feature;
    sharing: Feature;
    notifications: Feature;
    workspaces: Feature;
};
export type Modes = {
    inertia: boolean;
    api: boolean;
};
/** GET {prefix}/api/v1/bootstrap. */
export type Bootstrap = {
    schemaVersion: string;
    locale: string;
    modes: Modes;
    session: Session;
    features: Features;
    api: ApiManifest;
    kinds?: KindsInfo;
    limits?: Limits;
    crossLinks?: CrossLinks;
};
/** GET {prefix}/api/v1/status (ichava.admin) and the Stats page status prop: core's StatusData. */
export type Status = {
    lifecycle: unknown;
    registry: {
        packages: number;
        conflicts: unknown[];
    };
    orphans: unknown[];
    discovery: Record<string, unknown>;
    watcher: {
        lastScan: string | null;
    };
    logging: Record<string, unknown>;
    cache: {
        lastRebuild: Record<string, unknown> | null;
    };
    render: {
        optimizationLevel: string;
        fingerprint: string;
    };
};
export type Preferences = {
    filters: Record<string, unknown>;
    sorting: Record<string, unknown>;
    preferences: Record<string, unknown>;
    tree?: Record<string, unknown>;
};
/** The ichava Inertia prop, shared with every page. */
export type Ichava = {
    schemaVersion: string;
    locale: string;
    modes: Modes;
    features: Features;
    account: Links;
    storage: {
        tier: string | null;
        persistent: boolean | null;
    };
    prefix: string;
    perPage: number;
    defaultTheme: string;
    ui: {
        version: string | null;
        license: string;
        docsUrl: string | null;
        links: {
            label: string;
            href: string;
        }[];
        themeToggle: boolean;
    };
    snippets: Record<string, unknown> | unknown[];
    routes: Record<string, unknown>;
    kinds?: KindsInfo;
    limits?: Limits;
    crossLinks?: CrossLinks;
};
/** Props HandleInertiaRequests shares with every page. */
export type SharedProps = {
    auth: User | null;
    flash: {
        success: string | null;
        error: string | null;
    };
    preferences: Record<string, unknown>;
    ichava: Ichava;
};
export type AppliedFilters = {
    search: string | null;
    language: string | null;
    packages: string[];
    kind: Kind | null;
    /** Every kind asked for, in order; kind is the single one or null. Added in 1.4.0. */
    kinds?: Kind[];
    categories: string[];
    subs: string[];
    variants: string[];
    tags: string[];
    keywords: string[];
    sort_by: string;
    sort_direction: "asc" | "desc";
    page: number;
    per_page: number;
};
/** Props of the Browser/Index Inertia page. */
export type BrowserPage = SharedProps & ({
    icons: Icon[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        empty_reason: EmptyReason;
    };
    appliedFilters: AppliedFilters;
    filterOptions: Filters;
    statistics: Statistics;
    /** The category tree counted over the applied filters less the category selection (as GET /api/v1/icons/tree is asked by the browser). Reloaded with every listing visit since 1.3.0. */
    tree: unknown[];
    /** Every installed pack, whatever is selected, with the one the browser opens on marked default; the Inertia catalog's getCatalogMeta reads it with filterOptions.variants_by_package. */
    packages: Package[];
    favorites: number[];
    collections: Collection[];
    history: HistoryEntry[];
    commandHistory: Command[];
});
/** Props of the Stats/Index Inertia page. */
export type StatsPage = SharedProps & ({
    statistics: Record<string, unknown>;
    packageStats: {
        name: string;
        icon_count: number;
    }[];
    topCategories: unknown[];
    cacheStats: Record<string, unknown> | unknown[];
    cacheHealthy: boolean;
    updateStatus: Record<string, unknown> | unknown[];
    status: Status | null;
});
export type SessionResponse = {
    success: true;
    data: Session;
    message?: string;
};
export type BootstrapResponse = {
    success: true;
    data: Bootstrap;
    message?: string;
};
export type StatusResponse = {
    success: true;
    data: Status;
    message?: string;
};
export type LibraryResponse = {
    success: true;
    data: Library;
    message?: string;
};
export type IconResponse = {
    success: true;
    data: IconResource;
};
export type StatisticsResponse = {
    success: true;
    data: Statistics;
    message?: string;
};
export type PackagesResponse = {
    success: true;
    data: Package[];
    message?: string;
};
export type FavoritesResponse = {
    success: true;
    data: {
        ids: number[];
        icons: {
            id: number;
            name: string;
            package: string;
            svg_url: string;
        }[];
        count: number;
    };
    message?: string;
};
export type CollectionsResponse = {
    success: true;
    data: Collection[];
    message?: string;
};
export type HistoryResponse = {
    success: true;
    data: HistoryEntry[];
    message?: string;
};
export type CommandHistoryResponse = {
    success: true;
    data: Command[];
    message?: string;
};
export type PreferencesResponse = {
    success: true;
    data: Preferences;
};
/** The bootstrap document's REST map, separate from each feature's Inertia-first endpoints. Added in 1.2.0. */
export type ApiManifest = {
    version: "v1";
    /** Absolute URL of {prefix}/api/v1, or null when the REST API is not mounted. */
    base: string | null;
    /** Every REST endpoint the client may call, by its own key, as an absolute URL under {prefix}/api/v1. Templated URLs keep {iconId}, {collectionId} and {package}. A key is absent when its route is not mounted or the feature gating it is off. */
    endpoints: {
        session?: string;
        bootstrap?: string;
        status?: string;
        "icons.list"?: string;
        "icons.show"?: string;
        "icons.svg"?: string;
        "icons.filters"?: string;
        "icons.tree"?: string;
        "icons.statistics"?: string;
        "icons.updateStatus"?: string;
        "packages.list"?: string;
        "packages.show"?: string;
        "terms.categories"?: string;
        "terms.variants"?: string;
        "terms.hierarchy"?: string;
        "library.show"?: string;
        "library.destroy"?: string;
        "favorites.list"?: string;
        "favorites.add"?: string;
        "favorites.remove"?: string;
        "favorites.toggle"?: string;
        "collections.list"?: string;
        "collections.create"?: string;
        "collections.show"?: string;
        "collections.rename"?: string;
        "collections.delete"?: string;
        "collections.addIcon"?: string;
        "collections.removeIcon"?: string;
        "history.list"?: string;
        "history.log"?: string;
        "history.clear"?: string;
        "commands.list"?: string;
        "commands.log"?: string;
        "commands.clear"?: string;
        "preferences.show"?: string;
        "preferences.update"?: string;
        "preferences.search"?: string;
        "preferences.filters"?: string;
        "preferences.reset"?: string;
        "cache.stats"?: string;
        "cache.clear"?: string;
        "cache.rebuild"?: string;
    } | unknown[];
};
/** One entry of the format registry (`x-ichava-formats`). */
export interface FormatEntry {
    id: Format;
    label: string;
    group: string;
    delivery: "laravel" | "client" | "generated" | "asset";
    kinds: readonly Kind[];
    copy: boolean;
    defaultCopy: boolean;
    /** An asset only a native toolchain builds (schema 1.6.0): the browser points at it, it cannot make it. */
    native?: true;
}
/** The code-tab and copy-format registry (`x-ichava-formats`), in tab order. */
export declare const FORMATS: readonly FormatEntry[];
