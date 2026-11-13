// The fetch boundary, as an instance (architecture.md 2.3). Framework-agnostic: no React,
// no store imports.
//
// Host facts are INJECTED, not assumed: base URL, credentials, timeout and the CSRF
// strategy are this transport's configuration. The Laravel + Sanctum preset ships as the
// default so the standalone app keeps working unchanged. Each mount, or each REST
// catalog, can hold its own transport; core/api/httpClient.ts keeps the old module-level
// functions working through one default instance.

import { getBrowserId } from '@/core/api/browserId';

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
export const LARAVEL_SANCTUM_PRESET: TransportConfig = {
  baseUrl: '/ichava/api/v1',
  credentials: 'include',
  timeoutMs: 15_000,
  csrf: {
    strategy: 'sanctum',
    metaName: 'csrf-token',
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-CSRF-TOKEN',
    endpoint: '/sanctum/csrf-cookie',
  },
};

export interface RequestOpts {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  /** SVG endpoint returns raw text, not JSON. */
  raw?: boolean;
  baseUrl?: string;
}

export class HttpError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(`HTTP ${status}: ${detail}`);
    this.status = status;
    this.detail = detail;
    this.name = 'HttpError';
  }
}

/**
 * A request that did not complete: the caller aborted it, or it timed out.
 *
 * Aborts previously rejected with the raw DOM `AbortError`, so a caller could not
 * tell "timed out" from "failed" from "I cancelled this myself" -- which matters,
 * because only the last of those should be silent.
 */
export class RequestAbortedError extends Error {
  reason: 'timeout' | 'caller';

  constructor(reason: 'timeout' | 'caller') {
    super(reason === 'timeout' ? 'Request timed out' : 'Request aborted by caller');
    this.reason = reason;
    this.name = 'RequestAbortedError';
  }
}

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  for (const part of document.cookie.split('; ')) {
    const eq = part.indexOf('=');
    if (eq > 0 && part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return '';
}

type TransportPatch = Partial<Omit<TransportConfig, 'csrf'>> & { csrf?: Partial<TransportConfig['csrf']> };

/**
 * One configured HTTP transport. `with()` returns a new transport with part of the
 * configuration changed, so a configured transport can be shared and specialised without
 * one caller's change reaching another's requests.
 *
 *   const transport = new HttpTransport().with({ baseUrl: '/admin/ichava/api/v1', csrf: { strategy: 'cookie' } });
 */
export class HttpTransport {
  readonly #config: TransportConfig;
  #csrfInitialized = false;

  constructor(config: TransportConfig = LARAVEL_SANCTUM_PRESET) {
    this.#config = { ...config, csrf: { ...config.csrf } };
  }

  /** The active configuration. Read-only; use `with()` for a changed transport. */
  get config(): Readonly<TransportConfig> {
    return this.#config;
  }

  /** A new transport with `patch` applied over this one's configuration. */
  with(patch: TransportPatch): HttpTransport {
    return new HttpTransport({
      ...this.#config,
      ...patch,
      csrf: { ...this.#config.csrf, ...(patch.csrf ?? {}) },
    });
  }

  #csrfToken(): string {
    const { strategy, metaName, cookieName } = this.#config.csrf;
    if (strategy === 'none') return '';
    if (typeof document === 'undefined') return '';
    if (strategy === 'cookie') return readCookie(cookieName);
    return document.querySelector<HTMLMetaElement>(`meta[name="${metaName}"]`)?.content ?? '';
  }

  /**
   * Prime the CSRF cookie once per transport. Only does anything under the `sanctum`
   * strategy; non-fatal, because the meta tag is the fallback.
   */
  async initCsrf(): Promise<void> {
    if (this.#config.csrf.strategy !== 'sanctum') return;
    if (this.#csrfInitialized || typeof fetch === 'undefined') return;
    this.#csrfInitialized = true;
    try {
      await fetch(this.#config.csrf.endpoint, { credentials: this.#config.credentials });
    } catch {
      /* the token header is the fallback */
    }
  }

  async request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
      const config = this.#config;
    const { method = 'GET', body, signal, raw = false, baseUrl = config.baseUrl } = opts;
    const hasBody = body != null;

    const ctrl = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, config.timeoutMs);

    // Removed in `finally`. Left attached, a caller reusing one long-lived signal
    // accumulated a listener per request for the life of that signal.
    const onAbort = () => ctrl.abort();
    signal?.addEventListener('abort', onAbort, { once: true });

    const headers: Record<string, string> = {
      Accept: raw ? 'image/svg+xml' : 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Browser-Id': getBrowserId(),
    };
    // Only when there IS a body. Setting it on a bodyless GET makes every read a
    // non-simple cross-origin request, so it needs a preflight -- and no OPTIONS
    // route is registered to answer one.
    if (hasBody) headers['Content-Type'] = 'application/json';
    const token = this.#csrfToken();
    if (token) headers[config.csrf.headerName] = token;

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        credentials: config.credentials,
        signal: ctrl.signal,
        headers,
        body: hasBody ? JSON.stringify(cleanPayload(body)) : undefined,
      });
      if (!res.ok) throw new HttpError(res.status, await safeText(res));
      return (raw ? await res.text() : await res.json()) as T;
    } catch (e) {
      // Normalise the DOM AbortError into something a caller can branch on.
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new RequestAbortedError(timedOut ? 'timeout' : 'caller');
      }
      throw e;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }
}

/** Strip null/undefined, Set→Array (ApiTransformer.cleanPayload parity). */
export function cleanPayload(v: unknown): unknown {
  if (v instanceof Set) return [...v];
  if (Array.isArray(v)) return v.map(cleanPayload);
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) {
      if (val === null || val === undefined) continue;
      out[k] = cleanPayload(val);
    }
    return out;
  }
  return v;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return res.statusText;
  }
}
