import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError, HttpTransport, RequestAbortedError, LARAVEL_SANCTUM_PRESET, type RequestOpts, type TransportConfig } from './httpClient';

// One transport per test, configured the way a catalog configures its own. These were the
// module-level helpers over a shared default transport, removed with that shared state.
let transport = new HttpTransport();
const resetTransport = () => { transport = new HttpTransport(); };
const configureTransport = (patch: Partial<Omit<TransportConfig, 'csrf'>> & { csrf?: Partial<TransportConfig['csrf']> }) => { transport = transport.with(patch); };
const transportConfig = () => transport.config;
const initCsrf = () => transport.initCsrf();
const request = <T,>(path: string, opts: RequestOpts = {}) => transport.request<T>(path, opts);

/**
 * The fetch boundary had no tests at all, which is how three defects lived here:
 * hardcoded host facts (A8), `Content-Type` on bodyless GETs (B14), and an abort
 * listener that was never removed (B15).
 */

type Call = { url: string; init: RequestInit };
let calls: Call[];

function mockFetch(impl?: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const fn = vi.fn(async (url: unknown, init: unknown) => {
    calls.push({ url: String(url), init: (init ?? {}) as RequestInit });
    if (impl) return impl(String(url), (init ?? {}) as RequestInit);
    return new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

const headersOf = (i: number) => (calls[i]!.init.headers ?? {}) as Record<string, string>;

beforeEach(() => {
  calls = [];
  resetTransport();
  document.head.innerHTML = '';
  document.cookie.split('; ').forEach((c) => {
    const k = c.split('=')[0];
    if (k) document.cookie = `${k}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetTransport();
});

describe('transport config (A8)', () => {
  it('ships the Laravel preset as the default', () => {
    expect(transportConfig()).toEqual(LARAVEL_SANCTUM_PRESET);
  });

  it('lets a host replace the base URL — it is never inferred', async () => {
    mockFetch();
    configureTransport({ baseUrl: '/custom/prefix/api/v1' });
    await request('/icons');
    expect(calls[0]!.url).toBe('/custom/prefix/api/v1/icons');
  });

  it('lets a host replace credentials mode', async () => {
    mockFetch();
    configureTransport({ credentials: 'same-origin' });
    await request('/icons');
    expect(calls[0]!.init.credentials).toBe('same-origin');
  });

  it('a per-call baseUrl still wins, for the per-mount case', async () => {
    mockFetch();
    configureTransport({ baseUrl: '/global' });
    await request('/icons', { baseUrl: '/per-call' });
    expect(calls[0]!.url).toBe('/per-call/icons');
  });
});

describe('csrf strategies (A8)', () => {
  it('none: sends no token header', async () => {
    mockFetch();
    document.head.innerHTML = '<meta name="csrf-token" content="ignored">';
    configureTransport({ csrf: { strategy: 'none' } });
    await request('/icons');
    expect(headersOf(0)['X-CSRF-TOKEN']).toBeUndefined();
  });

  it('meta: reads the configured meta tag', async () => {
    mockFetch();
    document.head.innerHTML = '<meta name="csrf-token" content="from-meta">';
    configureTransport({ csrf: { strategy: 'meta' } });
    await request('/icons');
    expect(headersOf(0)['X-CSRF-TOKEN']).toBe('from-meta');
  });

  it('meta: honours a non-default meta name and header name', async () => {
    mockFetch();
    document.head.innerHTML = '<meta name="_token" content="renamed">';
    configureTransport({ csrf: { strategy: 'meta', metaName: '_token', headerName: 'X-Custom-Csrf' } });
    await request('/icons');
    expect(headersOf(0)['X-Custom-Csrf']).toBe('renamed');
  });

  it('cookie: reads the cookie instead of the DOM', async () => {
    mockFetch();
    document.cookie = 'XSRF-TOKEN=from-cookie; path=/';
    configureTransport({ csrf: { strategy: 'cookie', headerName: 'X-XSRF-TOKEN' } });
    await request('/icons');
    expect(headersOf(0)['X-XSRF-TOKEN']).toBe('from-cookie');
  });

  it('omits the header entirely when no token is available', async () => {
    mockFetch();
    configureTransport({ csrf: { strategy: 'meta' } });
    await request('/icons');
    expect(headersOf(0)['X-CSRF-TOKEN']).toBeUndefined();
  });

  it('initCsrf primes the cookie only under the sanctum strategy', async () => {
    mockFetch();
    configureTransport({ csrf: { strategy: 'meta' } });
    await initCsrf();
    expect(calls).toHaveLength(0);

    resetTransport();
    configureTransport({ csrf: { strategy: 'sanctum', endpoint: '/my/csrf' } });
    await initCsrf();
    expect(calls[0]!.url).toBe('/my/csrf');
  });

  it('initCsrf runs at most once', async () => {
    mockFetch();
    await initCsrf();
    await initCsrf();
    expect(calls).toHaveLength(1);
  });
});

describe('Content-Type on bodyless requests (B14)', () => {
  it('does NOT set Content-Type on a GET with no body', async () => {
    mockFetch();
    await request('/icons');
    // Setting it makes every read a non-simple cross-origin request, so it needs a
    // preflight, and no OPTIONS route exists to answer one.
    expect(headersOf(0)['Content-Type']).toBeUndefined();
  });

  it('does set Content-Type when there is a body', async () => {
    mockFetch();
    await request('/preferences', { method: 'POST', body: { accent: '#7c3aed' } });
    expect(headersOf(0)['Content-Type']).toBe('application/json');
  });

  it('still sends Accept and the browser id on a bodyless GET', async () => {
    mockFetch();
    await request('/icons');
    expect(headersOf(0)['Accept']).toBe('application/json');
    expect(headersOf(0)['X-Browser-Id']).toBeTruthy();
  });

  it('asks for svg on a raw request', async () => {
    mockFetch(() => new Response('<svg/>', { status: 200 }));
    const out = await request<string>('/icons/1/svg', { raw: true });
    expect(headersOf(0)['Accept']).toBe('image/svg+xml');
    expect(out).toBe('<svg/>');
  });
});

describe('abort handling (B15)', () => {
  it('removes its abort listener on the success path', async () => {
    mockFetch();
    const ctrl = new AbortController();
    const add = vi.spyOn(ctrl.signal, 'addEventListener');
    const remove = vi.spyOn(ctrl.signal, 'removeEventListener');

    await request('/icons', { signal: ctrl.signal });
    await request('/icons', { signal: ctrl.signal });

    // A caller reusing one long-lived signal must not accumulate listeners.
    expect(add).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(2);
  });

  it('reports a caller abort as RequestAbortedError, not a raw AbortError', async () => {
    mockFetch((_url, init) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });
    const ctrl = new AbortController();
    const p = request('/icons', { signal: ctrl.signal });
    ctrl.abort();

    await expect(p).rejects.toBeInstanceOf(RequestAbortedError);
    await expect(p).rejects.toMatchObject({ reason: 'caller' });
  });

  it('distinguishes a timeout from a caller abort', async () => {
    mockFetch((_url, init) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });
    configureTransport({ timeoutMs: 10 });
    await expect(request('/icons')).rejects.toMatchObject({ name: 'RequestAbortedError', reason: 'timeout' });
  });
});

describe('errors', () => {
  it('throws HttpError with the status and body on a non-2xx', async () => {
    mockFetch(() => new Response('per_page must be <= 120', { status: 422 }));
    await expect(request('/icons')).rejects.toBeInstanceOf(HttpError);
    await expect(request('/icons')).rejects.toMatchObject({ status: 422, detail: 'per_page must be <= 120' });
  });
});
