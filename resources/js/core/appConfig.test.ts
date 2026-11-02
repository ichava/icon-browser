import { describe, expect, it } from 'vitest';

import { resolveConfig } from '@/lib/browser';
import { appConfig, browserConfig } from './appConfig';

/** `ichava.icon-browser.snippets` reaches the browser's own `snippets` config. */
describe('appConfig snippets', () => {
  const ui = { version: null, license: 'Proprietary', docsUrl: null, links: [] };

  it('passes the host snippet config through, over the library defaults', () => {
    const config = resolveConfig(appConfig({ ui, snippets: { tabs: ['blade', 'name'], className: 'size-5' } }));
    expect(config.snippets.tabs).toEqual(['blade', 'name']);
    expect(config.snippets.className).toBe('size-5');
    expect(config.snippets.templates).toEqual({});
  });

  it('keeps the library defaults when the host sent none', () => {
    const fallback = resolveConfig({}).snippets;
    expect(resolveConfig(appConfig({ ui, snippets: {} })).snippets).toEqual(fallback);
    expect(resolveConfig(appConfig({ snippets: { className: 'x' } })).snippets.className).toBe('x');
  });
});

/** The host's user and features manifest reach the browser config (`hostConfigFromProps`). */
describe('browserConfig', () => {
  const ui = { version: '0.1.0', license: 'Proprietary', docsUrl: null, links: [] };
  const on = (endpoints: Record<string, string> = {}) => ({ enabled: true, reason: null, endpoints });
  const off = { enabled: false, reason: 'config' as const, endpoints: {} };
  const features = {
    favorites: on(), collections: on(), history: on(), commands: on(), library: on({ destroy: 'https://app.test/ichava/library' }),
    preferences: on(), status: { ...off, reason: 'gate' as const }, cacheAdmin: off, illustrations: off, searchLanguage: off,
    export: on(), motion: on(), themeToggle: off, presence: off, invites: off, sharing: off, notifications: off, workspaces: off,
  };
  const ichava = {
    schemaVersion: '1.3.0', locale: 'fr', modes: { inertia: true, api: false }, features,
    account: { login: 'https://app.test/login', logout: 'https://app.test/logout' }, storage: { tier: 'database', persistent: true },
    prefix: 'ichava', perPage: 48, defaultTheme: 'dark', ui, snippets: { className: 'size-5' },
  };
  const auth = { id: '7', name: 'Grace Hopper', avatarUrl: null, abilities: { 'ichava.admin': false } };

  it("merges the host's user and manifest over this package's config", () => {
    const config = resolveConfig(browserConfig({ auth, ichava: ichava as never }));
    expect(config.host?.source).toBe('inertia');
    expect(config.host?.user?.name).toBe('Grace Hopper');
    expect(config.features).toMatchObject({ favorites: true, themeToggle: false, presence: false, status: false, demo: false });
    expect(config.ui.defaultTheme).toBe('dark');
    expect(config.defaults.perPage).toBe(48);
    // This package's own fields stay.
    expect(config.snippets.className).toBe('size-5');
    expect(config.meta.license).toBe('Proprietary');
  });

  it('adds nothing for props without a features manifest', () => {
    expect(browserConfig({ auth: null, ichava: { ui, snippets: {} } as never })).toEqual(appConfig({ ui, snippets: {} }));
    expect(resolveConfig(browserConfig(null)).host).toBeNull();
  });
});
