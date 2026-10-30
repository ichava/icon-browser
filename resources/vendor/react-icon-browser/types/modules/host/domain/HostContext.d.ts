import type { ApiManifest, Bootstrap, Feature, Features, Ichava, Links, Modes, User } from '../../../core/api/schema.gen';
/** A feature icon-browser's manifest reports on: `favorites`, `status`, `presence`... */
export type FeatureName = keyof Features;
/** Where the host context came from: Inertia page props, or the REST bootstrap document. */
export type HostSource = 'inertia' | 'rest';
/** A key of the bootstrap document's REST map: `icons.list`, `favorites.add`, `library.show`... */
export type ApiEndpointKey = keyof Exclude<ApiManifest['endpoints'], unknown[]>;
/**
 * The REST map from `GET {prefix}/api/v1/bootstrap` (payload schema 1.2.0): the API's
 * version, its absolute base, and every endpoint by its own key, templates included.
 */
export interface HostApi {
    version: string;
    /** Absolute URL of `{prefix}/api/v1`, or null when the REST API is not mounted. */
    base: string | null;
    endpoints: Readonly<Partial<Record<ApiEndpointKey, string>>>;
}
/**
 * What the host application told the browser about itself: who is signed in, which
 * features it offers and where they live, where its sign-in and sign-out are, and where
 * the library is kept. One shape whether it arrived in the Inertia `auth` and `ichava`
 * props or in `GET {prefix}/api/v1/bootstrap`.
 *
 * The browser has no auth of its own. In a host it never invents a user, never shows a
 * module the manifest turned off, and never builds a URL the manifest did not give it.
 */
export interface HostContext {
    source: HostSource;
    /** The payload schema version the host serves. */
    schemaVersion: string;
    /** Whether that version's major matches the one these types were generated from. */
    compatible: boolean;
    /** The host's `app()->getLocale()`, when it sent one. */
    locale: string | null;
    modes: Modes;
    /** The signed-in user (`UserData`: id, name, avatarUrl, abilities), or null for a guest. */
    user: User | null;
    features: Readonly<Partial<Record<FeatureName, Feature>>>;
    /** The host's own sign-in and sign-out routes; null when it has none. */
    links: Links;
    /** Where the library is kept: `database`, `session` or `browser`. */
    storage: {
        tier: string | null;
        persistent: boolean | null;
    };
    defaultTheme: 'light' | 'dark' | null;
    perPage: number | null;
    /**
     * The REST map from the bootstrap document, which every REST URL is read from. Null in
     * an Inertia host (its props carry no REST map) and from an icon-browser older than
     * payload schema 1.2.0.
     */
    api?: HostApi | null;
}
/** The host Gates the browser reads. A host grants them; the package denies by default. */
export declare const ABILITIES: {
    readonly admin: 'ichava.admin';
    readonly manageCache: 'ichava.manage-cache';
};
/** Whether a schema version is one these types can read: the same major version. */
export declare function isCompatible(version: string, ours?: string): boolean;
/**
 * The host context from Inertia's shared props (`auth` and `ichava`). Null when the
 * props carry no features manifest: an icon-browser older than payload schema 1.0.0,
 * which the browser then treats as no host at all rather than half of one.
 */
export declare function hostFromInertia(props: {
    auth?: User | null;
    ichava?: Partial<Ichava> | null;
} | null | undefined): HostContext | null;
/** The host context from `GET {prefix}/api/v1/bootstrap` (the document, unwrapped). */
export declare function hostFromBootstrap(doc: Bootstrap): HostContext;
/** The bootstrap's REST map, with PHP's empty-map `[]` read as no endpoints. Null when absent. */
export declare function hostApi(api: Partial<ApiManifest> | null | undefined): HostApi | null;
/** A feature as the manifest reports it, or off when the manifest does not mention it. */
export declare function feature(host: HostContext, name: FeatureName): Feature;
/** Whether to render a feature: on in the manifest, and the user holds any ability it needs. */
export declare function featureOn(host: HostContext, name: FeatureName): boolean;
/**
 * One of a feature's endpoints, exactly as the manifest gave it, or null when the
 * feature is off or the host mounted no such route. Never constructed client-side.
 */
export declare function endpoint(host: HostContext, name: FeatureName, key: string): string | null;
/** Fill a templated endpoint's `{name}` placeholders. A placeholder left unfilled throws. */
export declare function fillEndpoint(template: string, params: Readonly<Record<string, string | number>>): string;
/**
 * Which ability-gated admin actions this user may take, for the cards that show them.
 * The UI checks abilities, never roles.
 */
export declare function can(host: HostContext | null, ability: string): boolean;
/**
 * PostgreSQL's full-text configuration for a UI locale, so search stems in the reader's
 * language when the host offers `searchLanguage`. Swahili has no PostgreSQL
 * configuration, and an unknown locale gets none: the server then uses its default.
 */
export declare function searchLanguageFor(locale: string): string | undefined;
/**
 * One REST endpoint from the bootstrap document's map, exactly as the host gave it, or
 * null when the host has no REST map or did not mount that route for this user. Templates
 * keep `{iconId}`, `{collectionId}` and `{package}`; fill them with `fillEndpoint`.
 */
export declare function apiEndpoint(host: HostContext | null | undefined, key: ApiEndpointKey): string | null;
/**
 * The REST library routes, for a host whose browser talks REST (`source: 'rest'`), read
 * from the bootstrap document's REST map (`api.endpoints`). Null when the host sent no
 * REST map or no `library.show`, so there is nothing to load or keep. Every URL is the
 * host's own; none is built here. `api` carries the whole map for the per-operation
 * routes (`favorites.add`, `collections.addIcon`...).
 */
export declare function restLibraryEndpoints(host: HostContext): {
    library: string;
    favorites: string | null;
    collections: string | null;
    history: string | null;
    commands: string | null;
    preferences: string | null;
    api: Readonly<Partial<Record<ApiEndpointKey, string>>>;
} | null;
