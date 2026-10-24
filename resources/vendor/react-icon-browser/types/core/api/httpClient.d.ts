import { HttpTransport, type RequestOpts, type TransportConfig } from '../../modules/catalog';
export { HttpError, HttpTransport, LARAVEL_SANCTUM_PRESET, RequestAbortedError, cleanPayload, type CsrfStrategy, type RequestOpts, type TransportConfig, } from '../../modules/catalog';
/** The transport the module-level functions use. */
export declare function getDefaultTransport(): HttpTransport;
/**
 * Override any part of the default transport config. Call once, before the first request.
 *
 * @deprecated since 0.1.x; may be removed in 0.2.0. It changes the transport every
 * module-level caller shares, so a second mount re-points the first. Give each REST
 * catalog its own: `RestCatalog.at(base).csrf('cookie')`, or `new HttpTransport().with(...)`.
 */
export declare function configureTransport(patch: Partial<Omit<TransportConfig, 'csrf'>> & {
    csrf?: Partial<TransportConfig['csrf']>;
}): void;
/**
 * The default transport's config. Read-only; use `configureTransport` to change it.
 *
 * @deprecated since 0.1.x; may be removed in 0.2.0. Read `transport.config` from the
 * `HttpTransport` a catalog uses.
 */
export declare function transportConfig(): Readonly<TransportConfig>;
/** Reset the default transport to the shipped preset. Test helper. */
export declare function resetTransport(): void;
/**
 * Prime the CSRF cookie once, on the default transport.
 *
 * @deprecated since 0.1.x; may be removed in 0.2.0. Use `HttpTransport#initCsrf()`.
 */
export declare function initCsrf(): Promise<void>;
/**
 * A request through the default transport.
 *
 * @deprecated since 0.1.x; may be removed in 0.2.0. Use `HttpTransport#request()`.
 */
export declare function request<T>(path: string, opts?: RequestOpts): Promise<T>;
