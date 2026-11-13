// The fetch boundary's entry point. The transport is an instance (`HttpTransport`, in
// modules/catalog/infrastructure), so two mounts can talk to two APIs. One default
// instance, on the shipped preset, serves `new RestCatalog()` and absolute SVG URLs; a
// catalog that needs other settings takes its own (`RestCatalog.at(base).csrf(...)`).
//
// The module-level helpers over a mutable default (`configureTransport`, `transportConfig`,
// `initCsrf`, `request`) were removed after their deprecation: changing the shared default
// re-pointed every mount, and nothing in the estate called them.

import { HttpTransport } from '@/modules/catalog';

export {
  HttpError,
  HttpTransport,
  LARAVEL_SANCTUM_PRESET,
  RequestAbortedError,
  cleanPayload,
  type CsrfStrategy,
  type RequestOpts,
  type TransportConfig,
} from '@/modules/catalog';

const defaultTransport = new HttpTransport();

/** The default transport, on the shipped preset. */
export function getDefaultTransport(): HttpTransport {
  return defaultTransport;
}

