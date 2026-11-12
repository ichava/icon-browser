import { describe, expect, it } from 'vitest';
import {
  apiEndpoint,
  endpoint,
  featureOn,
  fillEndpoint,
  hostConfig,
  hostConfigFromProps,
  hostFromBootstrap,
  hostFromInertia,
  initialKind,
  isCompatible,
  restLibraryEndpoints,
  searchLanguageFor,
} from '@/modules/host';
import { resolveConfig } from '@/core/config';
import type { Bootstrap } from '@/core/api/schema.gen';
import { ADA, API, MAP, bootstrapDoc, ichavaProp, manifest } from '@/test/hostFixtures';

describe('the host context', () => {
  it('reads the Inertia props, and is absent without a features manifest', () => {
    expect(hostFromInertia({ auth: ADA, ichava: { prefix: 'ichava' } as never })).toBeNull();
    expect(hostFromInertia(null)).toBeNull();
    const host = hostFromInertia({ auth: ADA, ichava: ichavaProp() })!;
    expect(host.source).toBe('inertia');
    expect(host.user?.name).toBe('Ada Lovelace');
    expect(host.links.login).toBe('https://app.test/login');
    expect(host.storage).toEqual({ tier: 'database', persistent: true });
    expect(host.compatible).toBe(true);
  });

  it('reads the REST bootstrap document', () => {
    const host = hostFromBootstrap({
      schemaVersion: '1.0.0',
      locale: 'fr',
      modes: { inertia: false, api: true },
      features: manifest(),
      session: { schemaVersion: '1.0.0', authenticated: false, user: null, tier: 'session', persistent: true, links: { login: null, logout: null } },
      api: { version: 'v1', base: null, endpoints: [] },
    });
    expect(host.source).toBe('rest');
    expect(host.user).toBeNull();
    expect(host.locale).toBe('fr');
    expect(host.storage.tier).toBe('session');
  });

  it('checks the schema major version', () => {
    expect(isCompatible('1.4.2', '1.0.0')).toBe(true);
    expect(isCompatible('2.0.0', '1.0.0')).toBe(false);
    expect(isCompatible('', '1.0.0')).toBe(false);
  });

  it('renders a feature only when enabled, and an admin one only with the ability', () => {
    const on = { enabled: true, reason: null, endpoints: { status: `${API}/status` } };
    const host = hostFromInertia({ auth: ADA, ichava: ichavaProp({ features: manifest({ status: on }) }) })!;
    expect(featureOn(host, 'favorites')).toBe(true);
    expect(featureOn(host, 'presence')).toBe(false);
    // Enabled in the manifest, but this user lacks ichava.admin: fails closed.
    expect(featureOn(host, 'status')).toBe(false);
    expect(endpoint(host, 'status', 'status')).toBeNull();
    const admin = hostFromInertia({ auth: { ...ADA, abilities: { 'ichava.admin': true } }, ichava: ichavaProp({ features: manifest({ status: on }) }) })!;
    expect(featureOn(admin, 'status')).toBe(true);
    expect(endpoint(admin, 'status', 'status')).toBe(`${API}/status`);
  });

  it('gives endpoints exactly as the manifest has them, and fills templates', () => {
    const host = hostFromInertia({ auth: ADA, ichava: ichavaProp() })!;
    const toggle = endpoint(host, 'favorites', 'toggle')!;
    expect(toggle).toBe(`${API}/favorites/{iconId}/toggle`);
    expect(fillEndpoint(toggle, { iconId: 7 })).toBe(`${API}/favorites/7/toggle`);
    expect(() => fillEndpoint(toggle, {})).toThrow(/iconId/);
    expect(endpoint(host, 'favorites', 'missing')).toBeNull();
    expect(endpoint(host, 'export', 'any')).toBeNull(); // PHP's empty map arrives as []
  });

  it('reads the REST map from the bootstrap document, and has none in Inertia props', () => {
    const host = hostFromBootstrap(bootstrapDoc());
    expect(host.api).toEqual({ version: 'v1', base: 'https://app.test/v1-root', endpoints: MAP });
    expect(apiEndpoint(host, 'collections.addIcon')).toBe(MAP['collections.addIcon']);
    expect(apiEndpoint(host, 'cache.clear')).toBeNull(); // not mounted for this user
    // PHP sends an empty map as [].
    expect(hostFromBootstrap(bootstrapDoc({ api: { version: 'v1', base: null, endpoints: [] } })).api).toEqual({ version: 'v1', base: null, endpoints: {} });
    expect(hostFromInertia({ auth: ADA, ichava: ichavaProp() })!.api ?? null).toBeNull();
    expect(apiEndpoint(null, 'icons.list')).toBeNull();
  });

  it('takes every REST library URL from the REST map, deriving none', () => {
    const host = hostFromBootstrap(bootstrapDoc());
    expect(restLibraryEndpoints(host)).toEqual({
      library: MAP['library.show'],
      favorites: MAP['favorites.list'],
      collections: MAP['collections.list'],
      history: MAP['history.list'],
      commands: MAP['commands.list'],
      preferences: MAP['preferences.show'],
      api: MAP,
    });
    // A feature off in the manifest has no URL, even if a route is listed.
    const noHistory = hostFromBootstrap(bootstrapDoc({ features: manifest({ history: { enabled: false, reason: 'config', endpoints: [] } }) }));
    expect(restLibraryEndpoints(noHistory)?.history).toBeNull();
    // No REST map (an Inertia host, or an icon-browser before 1.2.0): nothing to call.
    expect(restLibraryEndpoints(hostFromInertia({ auth: ADA, ichava: ichavaProp() })!)).toBeNull();
    const noLibrary = hostFromBootstrap(bootstrapDoc({ api: { version: 'v1', base: null, endpoints: { 'favorites.list': MAP['favorites.list'] } } }));
    expect(restLibraryEndpoints(noLibrary)).toBeNull();
  });

  it('points the API tab at the host SVG route', () => {
    expect(resolveConfig(hostConfig(hostFromBootstrap(bootstrapDoc()))).snippets.svgEndpoint).toBe(MAP['icons.svg']);
    expect(resolveConfig(hostConfig(hostFromInertia({ auth: ADA, ichava: ichavaProp() })!)).snippets.svgEndpoint).toBeUndefined();
  });

  it('maps a UI locale to a PostgreSQL search language', () => {
    expect(searchLanguageFor('en')).toBe('english');
    expect(searchLanguageFor('pt-BR')).toBe('portuguese');
    expect(searchLanguageFor('sw')).toBeUndefined();
  });
});

describe('hostConfig', () => {
  it('turns the manifest into feature flags and switches the demo off', () => {
    const config = resolveConfig(hostConfigFromProps({ auth: ADA, ichava: ichavaProp() }));
    expect(config.features).toMatchObject({
      demo: false,
      favorites: true,
      collections: true,
      history: true,
      themeToggle: true,
      presence: false,
      invites: false,
      sharing: false,
      notifications: false,
      workspaces: false,
      status: false,
      illustrations: false,
    });
    expect(config.host?.user?.id).toBe('42');
    expect(config.ui.defaultTheme).toBe('light');
    expect(config.defaults.perPage).toBe(24);
  });

  it('leaves the defaults alone for props with no manifest', () => {
    expect(hostConfigFromProps({ ichava: null })).toEqual({});
    expect(resolveConfig(null).host).toBeNull();
  });

  it('carries the host theme switch through', () => {
    const host = hostFromInertia({ auth: null, ichava: ichavaProp({ features: manifest({ themeToggle: { enabled: false, reason: 'config', endpoints: [] } }) }) })!;
    expect(resolveConfig(hostConfig(host)).features.themeToggle).toBe(false);
  });
});

describe('the API v1 1.4.0 additions (contract §5.3)', () => {
  const kinds = { default: 'icon' as const, available: ['icon', 'illustration'] as ('icon' | 'illustration')[], counts: { icon: 17301, illustration: 46 } };
  const v14 = (over: Partial<Bootstrap> = {}) =>
    bootstrapDoc({ schemaVersion: '1.4.0', kinds, limits: { svgMaxNodes: 1200, svgMaxChars: 90000 }, crossLinks: { landing: 'https://ichava.com' }, ...over });

  it('reads kinds, limits and crossLinks from the bootstrap document and the Inertia props', () => {
    const rest = hostFromBootstrap(v14());
    expect(rest.kinds).toEqual(kinds);
    expect(rest.limits).toEqual({ svgMaxNodes: 1200, svgMaxChars: 90000 });
    expect(rest.crossLinks).toEqual({ landing: 'https://ichava.com' });
    const inertia = hostFromInertia({ auth: ADA, ichava: ichavaProp({ crossLinks: { landing: 'https://ichava.com/' } }) })!;
    expect(inertia.crossLinks).toEqual({ landing: 'https://ichava.com/' });
    // A 1.3.0 host sends none of them, and nothing is invented.
    const old = hostFromBootstrap(bootstrapDoc());
    expect(old.kinds ?? null).toBeNull();
    expect(old.limits ?? null).toBeNull();
    expect(old.crossLinks ?? null).toBeNull();
  });

  it('renders the landing link only for an http(s) URL', () => {
    const landing = (value: unknown) => hostFromBootstrap(v14({ crossLinks: { landing: value as string } })).crossLinks?.landing ?? null;
    expect(landing('https://ichava.com')).toBe('https://ichava.com');
    expect(landing('http://localhost:8000/')).toBe('http://localhost:8000/');
    expect(landing(null)).toBeNull();
    expect(landing('')).toBeNull();
    expect(landing('javascript:alert(1)')).toBeNull();
    expect(landing('/relative')).toBeNull();
    expect(resolveConfig(hostConfig(hostFromBootstrap(v14()))).crossLinks.landing).toBe('https://ichava.com');
    expect(resolveConfig(hostConfig(hostFromBootstrap(bootstrapDoc()))).crossLinks.landing).toBeNull();
  });

  it('overrides the SVG limits with positive integers only, field by field', () => {
    expect(resolveConfig(hostConfig(hostFromBootstrap(v14()))).limits).toMatchObject({ svgMaxNodes: 1200, svgMaxChars: 90000 });
    // Defaults stay 30,000 / 4,500,000 without the field.
    expect(resolveConfig(hostConfig(hostFromBootstrap(bootstrapDoc()))).limits).toMatchObject({ svgMaxNodes: 30_000, svgMaxChars: 4_500_000 });
    const bad = hostFromBootstrap(v14({ limits: { svgMaxNodes: 0, svgMaxChars: 2.5 } }));
    expect(resolveConfig(hostConfig(bad)).limits).toMatchObject({ svgMaxNodes: 30_000, svgMaxChars: 4_500_000 });
    const half = hostFromBootstrap(v14({ limits: { svgMaxNodes: 500, svgMaxChars: -1 } }));
    expect(resolveConfig(hostConfig(half)).limits).toMatchObject({ svgMaxNodes: 500, svgMaxChars: 4_500_000 });
    // The rest of the limits block is the browser's own.
    expect(resolveConfig(hostConfig(hostFromBootstrap(v14()))).limits.historyCap).toBe(40);
  });

  it('opens on the host default kind, then the first available, then the first with items (§2.3)', () => {
    expect(initialKind(kinds)).toBe('icon');
    expect(initialKind({ ...kinds, default: 'illustration' })).toBe('illustration');
    // Illustrations are off: the default is not available.
    expect(initialKind({ default: 'illustration', available: ['icon'], counts: { icon: 5, illustration: 9 } })).toBe('icon');
    // The default kind is empty and another has items.
    expect(initialKind({ default: 'icon', available: ['icon', 'illustration'], counts: { icon: 0, illustration: 46 } })).toBe('illustration');
    // Everything empty: the default stands.
    expect(initialKind({ default: 'icon', available: ['icon', 'illustration'], counts: { icon: 0, illustration: 0 } })).toBe('icon');
    expect(initialKind(null)).toBeNull();
    expect(resolveConfig(hostConfig(hostFromBootstrap(v14({ kinds: { ...kinds, default: 'illustration' } })))).defaults.kind).toBe('illustration');
    expect(resolveConfig(hostConfig(hostFromBootstrap(bootstrapDoc()))).defaults.kind).toBeUndefined();
  });

  it('ignores a kinds block that is not the schema shape', () => {
    const odd = hostFromBootstrap(v14({ kinds: { default: 'scene', available: [], counts: {} } as never }));
    expect(odd.kinds ?? null).toBeNull();
  });
});
