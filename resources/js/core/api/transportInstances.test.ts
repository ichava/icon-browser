import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RestCatalog } from './ApiClient';
import { HttpError, HttpTransport, LARAVEL_SANCTUM_PRESET, getDefaultTransport } from './httpClient';
import { HttpError as ModuleHttpError } from '@/modules/catalog';

/**
 * Per-instance transports (architecture 2.3, A6-gaps G23). The transport was a module
 * global: a second mount's `configureTransport` re-pointed the first mount's REST client.
 * A `RestCatalog.at()` catalog holds its own transport, and the shared default can no longer
 * be re-pointed at all.
 */

type Call = { url: string; headers: Record<string, string>; credentials?: RequestCredentials };
let calls: Call[];

beforeEach(() => {
  calls = [];
  document.head.innerHTML = '<meta name="csrf-token" content="meta-token">';
  document.cookie = 'XSRF-TOKEN=cookie-token; path=/';
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown, init: RequestInit = {}) => {
      calls.push({ url: String(url), headers: (init.headers ?? {}) as Record<string, string>, credentials: init.credentials });
      return new Response('{"data":[],"meta":{"total":0,"per_page":10,"current_page":1,"last_page":1}}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
});

describe('HttpTransport', () => {
  it('is configured per instance, and with() leaves the original alone', () => {
    const a = new HttpTransport();
    const b = a.with({ baseUrl: '/b', csrf: { strategy: 'cookie' } });
    expect(a.config.baseUrl).toBe(LARAVEL_SANCTUM_PRESET.baseUrl);
    expect(a.config.csrf.strategy).toBe('sanctum');
    expect(b.config).toMatchObject({ baseUrl: '/b', csrf: { strategy: 'cookie', headerName: 'X-CSRF-TOKEN' } });
  });

  it('primes the CSRF cookie once per transport, not once per page', async () => {
    const a = new HttpTransport();
    const b = new HttpTransport();
    await a.initCsrf();
    await a.initCsrf();
    await b.initCsrf();
    expect(calls.filter((c) => c.url === '/sanctum/csrf-cookie')).toHaveLength(2);
  });

  it('keeps one HttpError class across the old and new paths', () => {
    expect(HttpError).toBe(ModuleHttpError);
  });
});

describe('RestCatalog.at()', () => {
  it('two catalogs keep their own base and CSRF strategy', async () => {
    const admin = RestCatalog.at('/admin/ichava/api/v1').csrf('cookie');
    const site = RestCatalog.at('/ichava/api/v1').csrf('meta').credentials('same-origin');
    await admin.listIcons({});
    await site.listIcons({});
    expect(calls[0]!.url).toMatch(/^\/admin\/ichava\/api\/v1\/icons/);
    expect(calls[0]!.headers['X-CSRF-TOKEN']).toBe('cookie-token');
    expect(calls[1]!.url).toMatch(/^\/ichava\/api\/v1\/icons/);
    expect(calls[1]!.headers['X-CSRF-TOKEN']).toBe('meta-token');
    expect(calls[1]!.credentials).toBe('same-origin');
  });

  it('new RestCatalog() uses the default transport on the shipped preset', async () => {
    const legacy = new RestCatalog('/legacy');
    await legacy.listIcons({});
    expect(calls[0]!.url).toMatch(/^\/legacy\/icons/);
    expect(calls[0]!.headers['X-CSRF-TOKEN']).toBe('meta-token');
    expect(calls[0]!.credentials).toBe(LARAVEL_SANCTUM_PRESET.credentials);
    expect(getDefaultTransport().config).toEqual(LARAVEL_SANCTUM_PRESET);
  });

  it('chains immutably', () => {
    const a = RestCatalog.at('/x');
    const b = a.timeout(10_000);
    expect(b).not.toBe(a);
    expect(a.transport.config.timeoutMs).toBe(LARAVEL_SANCTUM_PRESET.timeoutMs);
    expect(b.transport.config.timeoutMs).toBe(10_000);
  });
});
