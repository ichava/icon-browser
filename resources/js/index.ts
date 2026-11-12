// Library barrel — the public surface for the two consumers (the standalone demo
// and the in-Laravel parallel-run entry). Import from '@ichava/react-icon-browser'.

export { IchavaBrowser, type IchavaBrowserProps } from './IchavaBrowser';
export { mountIchavaBrowser, browser, type MountOptions } from './mount';
export { BrowserBuilder, type BrowserHandle, type BrowserBuilderPorts } from './app/BrowserBuilder';

// Data boundary — consumers pick static vs REST.
export { createCatalog, StaticCatalog, RestCatalog } from './core/api/ApiClient';
export type { IconCatalog, ListParams, DataSourceKind } from './core/api/ApiClient';
export { getBrowserId } from './core/api/browserId';
export { LARAVEL_SANCTUM_PRESET, HttpError, RequestAbortedError, HttpTransport } from './core/api/httpClient';
export type { TransportConfig, CsrfStrategy } from './core/api/httpClient';

// Core engine + model.
export { CatalogIndex as IconRepository, type Catalog } from '@/modules/catalog';
export { SvgFidelity, fidelity, assetUrl, svgDataUrl } from './core/SvgFidelity';
export {
  SnippetFactory,
  snippets,
  snippetTabs,
  snippetTokens,
  renderTemplate,
  iconPath,
  svgToJsx,
  SNIPPET_TABS,
  BUILTIN_SNIPPET_FORMATS,
  type BuiltinSnippetFormat,
  type SnippetBuilder,
  type SnippetContext,
  type SnippetFormat,
  type SnippetOptions,
} from '@/modules/snippets';
export type { SnippetConfig } from '@/core/types';
export { iconRef } from '@/modules/catalog';
export type {
  IconId,
  IconVariant,
  IconKind,
  RawIcon,
  Icon,
  IconPackage,
  Term,
  Filters,
  PageMeta,
  Envelope,
  PageResult,
} from '@ichava/js-ui-kernel';
export { svgHasOwnColors, toIcon } from '@ichava/js-ui-kernel';

// Store (app layer — the in-Laravel consumer may swap this for a per-request store).
export { useStore, type BrowserStore, type AppConfig } from './store';

// Config resolution -- the in-Laravel entry merges `window.ichavaConfig` (a
// PARTIAL, wire-format object) onto the library's own defaults the same way
// the standalone demo and the embedded fixture already do.
export { resolveConfig, CONFIG_DEFAULTS, type PartialConfig } from './core/config';

// The loader for work that runs past two seconds, for hosts with slow work of their own.
export { TaskLoaderView } from './components/ui/TaskLoader';
export { TASK_LOADER_DELAY_MS } from './state/slices/ui';

// Host integration: the browser inside a Laravel app running ichava/icon-browser. The host's
// signed-in user, its features manifest and endpoints, and its sign-in links arrive in the
// Inertia `auth` and `ichava` props (`hostConfigFromProps`) or in the REST bootstrap
// document (`loadHostConfig`); the payload types are generated from icon-browser's schema.
export {
  hostConfig,
  hostConfigFromProps,
  loadHostConfig,
  loadHostContext,
  hostFromInertia,
  hostFromBootstrap,
  featureOn,
  endpoint,
  fillEndpoint,
  isCompatible,
  restLibraryEndpoints,
  apiEndpoint,
  hostApi,
  ABILITIES,
  type HostContext,
  type FeatureName,
  type HostApi,
  type ApiEndpointKey,
} from '@/modules/host';
export { HostIdentity, DemoIdentity, type IdentityProvider, type IdentityUser } from '@/modules/identity';
export { diffLibrary, RestLibrary, type LibraryOp, type LibraryView, type LibraryEndpoints } from '@/modules/library';
export { RestPreferences, type HostPreferences, type PreferenceEndpoints } from '@/modules/preferences';
export { mergeConfig } from './core/config';
export { emptyReasonFor, type ListedPage } from './core/api/ApiClient';
export { PAYLOAD_SCHEMA_VERSION } from './core/api/schema.gen';
export type {
  Bootstrap as HostBootstrap,
  Session as HostSession,
  User as HostUser,
  Feature as HostFeature,
  Features as HostFeatures,
  Ichava as HostIchavaProp,
  ApiManifest as HostApiManifest,
  SharedProps as HostSharedProps,
  EmptyReason,
} from './core/api/schema.gen';

// Locale catalogs other than English load on demand (re-audit F-12); a host can load one, or all,
// up front.
export { loadLocale, loadAllLocales } from './core/i18n';
