import type { PartialConfig } from '@/core/config';
import type { BootstrapResponse, Ichava, User } from '@/core/api/schema.gen';
import { getDefaultTransport } from '@/core/api/httpClient';
import type { HttpTransport } from '@/modules/catalog';
import { featureOn, hostFromBootstrap, hostFromInertia, initialKind, type FeatureName, type HostContext } from '../domain/HostContext';

/** Every feature the manifest reports, in the order the config lists them. */
const FEATURES: readonly FeatureName[] = [
  'favorites', 'collections', 'history', 'commands', 'library', 'preferences', 'status', 'cacheAdmin',
  'illustrations', 'searchLanguage', 'export', 'motion', 'themeToggle',
  'presence', 'invites', 'sharing', 'notifications', 'workspaces',
];

/**
 * The browser config a host context implies: each feature flag from the manifest (and
 * the user's abilities, for the admin ones), the host's theme, page size and locale, its
 * initial kind, SVG limits and landing link (schema 1.4.0), and the context itself as
 * `config.host` for the identity, the library sync and the URLs.
 *
 * The demo fixtures are switched off: in a host there is no sample user, no seeded
 * notifications and no fabricated collaborators. Merge it over a host's own partial
 * config with `resolveConfig`.
 */
export function hostConfig(host: HostContext): PartialConfig {
  const features: Record<string, boolean> = { demo: false };
  for (const name of FEATURES) features[name] = featureOn(host, name);
  const svg = host.api?.endpoints['icons.svg'];
  const kind = initialKind(host.kinds);
  // The host's SVG ceilings replace the browser's own only when they are positive integers.
  const limits = {
    ...(host.limits?.svgMaxNodes ? { svgMaxNodes: host.limits.svgMaxNodes } : {}),
    ...(host.limits?.svgMaxChars ? { svgMaxChars: host.limits.svgMaxChars } : {}),
  };
  const defaults = { ...(host.perPage ? { perPage: host.perPage } : {}), ...(kind ? { kind } : {}) };
  return {
    features,
    ...(svg ? { snippets: { svgEndpoint: svg } } : {}),
    ...(host.defaultTheme ? { ui: { defaultTheme: host.defaultTheme } } : {}),
    ...(Object.keys(defaults).length ? { defaults } : {}),
    ...(Object.keys(limits).length ? { limits } : {}),
    ...(host.crossLinks ? { crossLinks: { landing: host.crossLinks.landing } } : {}),
    ...(host.locale ? { i18n: { locale: host.locale } } : {}),
    host,
  };
}

/**
 * The browser config for a page Inertia rendered, from its shared `auth` and `ichava`
 * props. An empty object when the props carry no features manifest, so an older host
 * keeps the browser's defaults.
 *
 *   const config = resolveConfig(mergeConfig(appConfig(props), hostConfigFromProps(props)))
 */
export function hostConfigFromProps(props: { auth?: User | null; ichava?: Partial<Ichava> | null } | null | undefined): PartialConfig {
  const host = hostFromInertia(props);
  return host ? hostConfig(host) : {};
}

/**
 * The host context for a REST mount, from `GET {base}/bootstrap`. The URL is the one
 * entry point a REST host gives the browser; every other URL comes from the manifest.
 */
export async function loadHostContext(bootstrapUrl: string, transport: HttpTransport = getDefaultTransport()): Promise<HostContext> {
  const res = await transport.request<BootstrapResponse>(bootstrapUrl, { baseUrl: '' });
  return hostFromBootstrap(res.data);
}

/** `loadHostContext`, as browser config. */
export async function loadHostConfig(bootstrapUrl: string, transport?: HttpTransport): Promise<PartialConfig> {
  return hostConfig(await loadHostContext(bootstrapUrl, transport));
}
