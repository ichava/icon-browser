/**
 * How to obtain a CSRF token.
 *
 * - `none`    stateless JSON hosts; no token header is sent
 * - `meta`    read a `<meta>` tag (the Laravel default)
 * - `cookie`  read the `XSRF-TOKEN` cookie, send it as `X-XSRF-TOKEN`
 * - `sanctum` prime the cookie once at boot, then behave as `meta`
 */
export type CsrfStrategy = 'none' | 'meta' | 'cookie' | 'sanctum';
export interface TransportConfig {
    /** Never inferred. The host supplies it; Blade should render it from a route helper. */
    baseUrl: string;
    credentials: RequestCredentials;
    timeoutMs: number;
    csrf: {
        strategy: CsrfStrategy;
        /** `meta` / `sanctum`: the meta tag name to read. */
        metaName: string;
        /** `cookie`: the cookie to read. */
        cookieName: string;
        /** The header to send the token in. */
        headerName: string;
        /** `sanctum`: the endpoint that sets the CSRF cookie. */
        endpoint: string;
    };
}
/**
 * The Laravel + Sanctum preset. Shipped as the default so nothing has to be
 * configured for the first-party app, and documented as a preset so it is clear
 * these are host facts rather than properties of the transport.
 *
 * An embedded consumer must override `baseUrl` explicitly: a host that changes
 * `config('ichava.prefix')` or mounts under a subdirectory would otherwise break.
 */
export declare const LARAVEL_SANCTUM_PRESET: TransportConfig;
export interface RequestOpts {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    signal?: AbortSignal;
    /** SVG endpoint returns raw text, not JSON. */
    raw?: boolean;
    baseUrl?: string;
}
export declare class HttpError extends Error {
    status: number;
    detail: string;
    constructor(status: number, detail: string);
}
/**
 * A request that did not complete: the caller aborted it, or it timed out.
 *
 * Aborts previously rejected with the raw DOM `AbortError`, so a caller could not
 * tell "timed out" from "failed" from "I cancelled this myself" -- which matters,
 * because only the last of those should be silent.
 */
export declare class RequestAbortedError extends Error {
    reason: 'timeout' | 'caller';
    constructor(reason: 'timeout' | 'caller');
}
type TransportPatch = Partial<Omit<TransportConfig, 'csrf'>> & {
    csrf?: Partial<TransportConfig['csrf']>;
};
/**
 * One configured HTTP transport. `with()` returns a new transport with part of the
 * configuration changed, so a configured transport can be shared and specialised without
 * one caller's change reaching another's requests.
 *
 *   const transport = new HttpTransport().with({ baseUrl: '/admin/ichava/api/v1', csrf: { strategy: 'cookie' } });
 */
export declare class HttpTransport {
    #private;
    constructor(config?: TransportConfig);
    /** The active configuration. Read-only; use `with()` for a changed transport. */
    get config(): Readonly<TransportConfig>;
    /** A new transport with `patch` applied over this one's configuration. */
    with(patch: TransportPatch): HttpTransport;
    /**
     * Prime the CSRF cookie once per transport. Only does anything under the `sanctum`
     * strategy; non-fatal, because the meta tag is the fallback.
     */
    initCsrf(): Promise<void>;
    request<T>(path: string, opts?: RequestOpts): Promise<T>;
}
/** Strip null/undefined, Set→Array (ApiTransformer.cleanPayload parity). */
export declare function cleanPayload(v: unknown): unknown;
export {};
