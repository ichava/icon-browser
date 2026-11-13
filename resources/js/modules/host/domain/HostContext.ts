import type { ApiManifest, Bootstrap, CrossLinks, Feature, Features, Ichava, Kind, KindsInfo, Limits, Links, Modes, User } from '@/core/api/schema.gen';
import { PAYLOAD_SCHEMA_VERSION } from '@/core/api/schema.gen';
import { fillTemplate } from '@/core/api/endpointTemplate';

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
  storage: { tier: string | null; persistent: boolean | null };
  defaultTheme: 'light' | 'dark' | null;
  perPage: number | null;
  /**
   * The REST map from the bootstrap document, which every REST URL is read from. Null in
   * an Inertia host (its props carry no REST map) and from an icon-browser older than
   * payload schema 1.2.0.
   */
  api?: HostApi | null;
  /**
   * The host's default kind, the kinds it may show, and their unfiltered counts (schema
   * 1.4.0, `kinds`). Null from an older host, or when the block is not the schema shape.
   */
  kinds?: KindsInfo | null;
  /**
   * The host's SVG ceilings (schema 1.4.0, `limits`): core's `svg.max_elements` and
   * `svg.max_bytes`. Each field is null unless it is a positive integer.
   */
  limits?: { svgMaxNodes: number | null; svgMaxChars: number | null } | null;
  /** Links to the host's other surfaces (schema 1.4.0, `crossLinks`). `landing` is an http(s) URL or null. */
  crossLinks?: CrossLinks | null;
}

/** The host Gates the browser reads. A host grants them; the package denies by default. */
export const ABILITIES = {
  admin: 'ichava.admin',
  manageCache: 'ichava.manage-cache',
} as const;

/**
 * Features that need an ability on top of being enabled. The server already folds the
 * Gate into `enabled`; checking the user's abilities here as well means a manifest and a
 * user that disagree (a stale prop after sign-out) fail closed. Any one ability suffices.
 */
const NEEDS: Partial<Record<FeatureName, readonly string[]>> = {
  status: [ABILITIES.admin],
  cacheAdmin: [ABILITIES.manageCache, ABILITIES.admin],
};

const OFF: Feature = { enabled: false, reason: 'config', endpoints: {} };

/** Whether a schema version is one these types can read: the same major version. */
export function isCompatible(version: string, ours: string = PAYLOAD_SCHEMA_VERSION): boolean {
  const major = (v: string) => v.split('.')[0] ?? '';
  return version !== '' && major(version) === major(ours);
}

const KINDS: readonly Kind[] = ['icon', 'illustration'];
const isKind = (v: unknown): v is Kind => KINDS.includes(v as Kind);
const positiveInt = (v: unknown): number | null => (typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : null);
const count = (v: unknown): number | null => (typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : null);

/** The `kinds` block, when it is the schema's shape; null otherwise. */
function hostKinds(v: unknown): KindsInfo | null {
  if (!v || typeof v !== 'object') return null;
  const k = v as Partial<KindsInfo>;
  const available = Array.isArray(k.available) ? [...new Set(k.available.filter(isKind))] : [];
  const icon = count(k.counts?.icon);
  const illustration = count(k.counts?.illustration);
  if (!isKind(k.default) || !available.length || icon === null || illustration === null) return null;
  return { default: k.default, available, counts: { icon, illustration } };
}

/** The `limits` block, each field a positive integer or null; null when absent. */
function hostLimits(v: unknown): { svgMaxNodes: number | null; svgMaxChars: number | null } | null {
  if (!v || typeof v !== 'object') return null;
  const l = v as Partial<Limits>;
  return { svgMaxNodes: positiveInt(l.svgMaxNodes), svgMaxChars: positiveInt(l.svgMaxChars) };
}

/**
 * The `crossLinks` block, with `landing` kept only when it is an absolute http(s) URL, so
 * a host value can never become a `javascript:` link. Null when absent.
 */
function hostCrossLinks(v: unknown): CrossLinks | null {
  if (!v || typeof v !== 'object') return null;
  const raw = (v as Partial<CrossLinks>).landing;
  // An absolute http(s) URL with a host part. The domain layer has no DOM, so no `URL`.
  const landing = typeof raw === 'string' && /^https?:\/\/[^\s/?#]+[^\s]*$/i.test(raw) ? raw : null;
  return { landing };
}

/**
 * The kind the browser opens on (contract §2.3): the host's default; else, when that kind
 * is not available, the first available one; and when it has no items while another
 * available kind has some, the first kind with items. Null without a `kinds` block, so the
 * browser keeps its own default. A choice the user made and persisted wins over this.
 */
export function initialKind(kinds: KindsInfo | null | undefined): Kind | null {
  if (!kinds) return null;
  let kind = kinds.available.includes(kinds.default) ? kinds.default : (kinds.available[0] ?? kinds.default);
  if (kinds.counts[kind] === 0) kind = kinds.available.find((k) => kinds.counts[k] > 0) ?? kind;
  return kind;
}

const isLinks = (v: unknown): v is Links => !!v && typeof v === 'object' && 'login' in v && 'logout' in v;

function context(
  source: HostSource,
  ichava: Partial<Ichava> | Partial<Bootstrap>,
  user: User | null,
  links: Links,
  storage: HostContext['storage'],
): HostContext {
  const version = typeof ichava.schemaVersion === 'string' ? ichava.schemaVersion : '';
  const app = ichava as Partial<Ichava>;
  return {
    source,
    schemaVersion: version,
    compatible: isCompatible(version),
    locale: typeof ichava.locale === 'string' && ichava.locale ? ichava.locale : null,
    modes: ichava.modes ?? { inertia: source === 'inertia', api: source === 'rest' },
    user,
    features: (ichava.features ?? {}) as Partial<Record<FeatureName, Feature>>,
    links,
    storage,
    defaultTheme: app.defaultTheme === 'dark' || app.defaultTheme === 'light' ? app.defaultTheme : null,
    perPage: typeof app.perPage === 'number' && app.perPage > 0 ? app.perPage : null,
    kinds: hostKinds(ichava.kinds),
    limits: hostLimits(ichava.limits),
    crossLinks: hostCrossLinks(ichava.crossLinks),
  };
}

/**
 * The host context from Inertia's shared props (`auth` and `ichava`). Null when the
 * props carry no features manifest: an icon-browser older than payload schema 1.0.0,
 * which the browser then treats as no host at all rather than half of one.
 */
export function hostFromInertia(props: { auth?: User | null; ichava?: Partial<Ichava> | null } | null | undefined): HostContext | null {
  const ichava = props?.ichava;
  if (!ichava || typeof ichava !== 'object' || !ichava.features) return null;
  return context(
    'inertia',
    ichava,
    props?.auth ?? null,
    isLinks(ichava.account) ? ichava.account : { login: null, logout: null },
    { tier: ichava.storage?.tier ?? null, persistent: ichava.storage?.persistent ?? null },
  );
}

/** The host context from `GET {prefix}/api/v1/bootstrap` (the document, unwrapped). */
export function hostFromBootstrap(doc: Bootstrap): HostContext {
  return {
    ...context('rest', doc, doc.session.user, doc.session.links, { tier: doc.session.tier, persistent: doc.session.persistent }),
    api: hostApi(doc.api),
  };
}

/** The bootstrap's REST map, with PHP's empty-map `[]` read as no endpoints. Null when absent. */
export function hostApi(api: Partial<ApiManifest> | null | undefined): HostApi | null {
  if (!api || typeof api !== 'object') return null;
  const endpoints: Partial<Record<ApiEndpointKey, string>> = {};
  if (api.endpoints && !Array.isArray(api.endpoints)) {
    for (const [k, v] of Object.entries(api.endpoints)) if (typeof v === 'string' && v !== '') endpoints[k as ApiEndpointKey] = v;
  }
  return { version: typeof api.version === 'string' ? api.version : '', base: typeof api.base === 'string' && api.base ? api.base : null, endpoints };
}

/** A feature as the manifest reports it, or off when the manifest does not mention it. */
export function feature(host: HostContext, name: FeatureName): Feature {
  return host.features[name] ?? OFF;
}

/** Whether to render a feature: on in the manifest, and the user holds any ability it needs. */
export function featureOn(host: HostContext, name: FeatureName): boolean {
  if (!feature(host, name).enabled) return false;
  const needs = NEEDS[name];
  if (!needs) return true;
  const abilities = host.user?.abilities ?? {};
  return needs.some((a) => abilities[a] === true);
}

/**
 * One of a feature's endpoints, exactly as the manifest gave it, or null when the
 * feature is off or the host mounted no such route. Never constructed client-side.
 */
export function endpoint(host: HostContext, name: FeatureName, key: string): string | null {
  if (!featureOn(host, name)) return null;
  const eps = feature(host, name).endpoints;
  if (Array.isArray(eps)) return null; // PHP sends an empty map as []
  const url = eps[key];
  return typeof url === 'string' && url !== '' ? url : null;
}

/** Fill a templated endpoint's `{name}` placeholders. A placeholder left unfilled throws. */
export function fillEndpoint(template: string, params: Readonly<Record<string, string | number>>): string {
  return fillTemplate(template, params);
}

/**
 * Which ability-gated admin actions this user may take, for the cards that show them.
 * The UI checks abilities, never roles.
 */
export function can(host: HostContext | null, ability: string): boolean {
  return host?.user?.abilities[ability] === true;
}

/**
 * PostgreSQL's full-text configuration for a UI locale, so search stems in the reader's
 * language when the host offers `searchLanguage`. Swahili has no PostgreSQL
 * configuration, and an unknown locale gets none: the server then uses its default.
 */
export function searchLanguageFor(locale: string): string | undefined {
  const base = locale.toLowerCase().split(/[-_]/)[0] ?? '';
  return SEARCH_LANGUAGES[base];
}

const SEARCH_LANGUAGES: Readonly<Record<string, string>> = {
  en: 'english',
  es: 'spanish',
  fr: 'french',
  de: 'german',
  pt: 'portuguese',
  ar: 'arabic',
};

/**
 * One REST endpoint from the bootstrap document's map, exactly as the host gave it, or
 * null when the host has no REST map or did not mount that route for this user. Templates
 * keep `{iconId}`, `{collectionId}` and `{package}`; fill them with `fillEndpoint`.
 */
export function apiEndpoint(host: HostContext | null | undefined, key: ApiEndpointKey): string | null {
  const url = host?.api?.endpoints[key];
  return typeof url === 'string' && url !== '' ? url : null;
}

/**
 * The REST library routes, for a host whose browser talks REST (`source: 'rest'`), read
 * from the bootstrap document's REST map (`api.endpoints`). Null when the host sent no
 * REST map or no `library.show`, so there is nothing to load or keep. Every URL is the
 * host's own; none is built here. `api` carries the whole map for the per-operation
 * routes (`favorites.add`, `collections.addIcon`...).
 */
export function restLibraryEndpoints(host: HostContext): {
  library: string;
  favorites: string | null;
  collections: string | null;
  history: string | null;
  commands: string | null;
  preferences: string | null;
  api: Readonly<Partial<Record<ApiEndpointKey, string>>>;
} | null {
  const library = apiEndpoint(host, 'library.show');
  if (!library || !featureOn(host, 'library')) return null;
  const rest = (name: FeatureName, key: ApiEndpointKey): string | null => (featureOn(host, name) ? apiEndpoint(host, key) : null);
  return {
    library,
    favorites: rest('favorites', 'favorites.list'),
    collections: rest('collections', 'collections.list'),
    history: rest('history', 'history.list'),
    commands: rest('commands', 'commands.list'),
    preferences: rest('preferences', 'preferences.show'),
    api: host.api?.endpoints ?? {},
  };
}
