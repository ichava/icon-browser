import type { PartialConfig } from '../../../core/config';
import type { Ichava, User } from '../../../core/api/schema.gen';
import type { HttpTransport } from '../../catalog';
import { type HostContext } from '../domain/HostContext';
/**
 * The browser config a host context implies: each feature flag from the manifest (and
 * the user's abilities, for the admin ones), the host's theme, page size and locale, and
 * the context itself as `config.host` for the identity, the library sync and the URLs.
 *
 * The demo fixtures are switched off: in a host there is no sample user, no seeded
 * notifications and no fabricated collaborators. Merge it over a host's own partial
 * config with `resolveConfig`.
 */
export declare function hostConfig(host: HostContext): PartialConfig;
/**
 * The browser config for a page Inertia rendered, from its shared `auth` and `ichava`
 * props. An empty object when the props carry no features manifest, so an older host
 * keeps the browser's defaults.
 *
 *   const config = resolveConfig(mergeConfig(appConfig(props), hostConfigFromProps(props)))
 */
export declare function hostConfigFromProps(props: {
    auth?: User | null;
    ichava?: Partial<Ichava> | null;
} | null | undefined): PartialConfig;
/**
 * The host context for a REST mount, from `GET {base}/bootstrap`. The URL is the one
 * entry point a REST host gives the browser; every other URL comes from the manifest.
 */
export declare function loadHostContext(bootstrapUrl: string, transport?: HttpTransport): Promise<HostContext>;
/** `loadHostContext`, as browser config. */
export declare function loadHostConfig(bootstrapUrl: string, transport?: HttpTransport): Promise<PartialConfig>;
