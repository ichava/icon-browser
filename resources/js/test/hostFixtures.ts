import type { Bootstrap, Features, Ichava, User } from '@/core/api/schema.gen';

/** The REST API a fixture host mounts, as icon-browser 1.0.0 does (`{prefix}/api/v1`). */
export const API = 'https://app.test/ichava/api/v1';

const on = (endpoints: Record<string, string> = {}) => ({ enabled: true, reason: null, endpoints });
const off = (reason: 'config' | 'gate' | 'driver' | 'empty' = 'config') => ({ enabled: false, reason, endpoints: [] as unknown[] });

/** A features manifest as an Inertia host sends it: library on, demo modules off. */
export function manifest(overrides: Partial<Features> = {}): Features {
  return {
    favorites: on({ list: 'https://app.test/ichava/favorites', toggle: `${API}/favorites/{iconId}/toggle` }),
    collections: on({ list: 'https://app.test/ichava/collections', create: 'https://app.test/ichava/collections' }),
    history: on({ list: 'https://app.test/ichava/history', store: 'https://app.test/ichava/history', clear: 'https://app.test/ichava/history' }),
    commands: on({ list: 'https://app.test/ichava/command-history' }),
    library: on({ show: `${API}/library`, destroy: 'https://app.test/ichava/library' }),
    preferences: on({ show: 'https://app.test/ichava/settings' }),
    status: off('gate'),
    cacheAdmin: off('gate'),
    illustrations: off('empty'),
    searchLanguage: off('driver'),
    export: on(),
    motion: on(),
    themeToggle: on(),
    presence: off(),
    invites: off(),
    sharing: off(),
    notifications: off(),
    workspaces: off(),
    ...overrides,
  } as Features;
}

export const ADA: User = { id: '42', name: 'Ada Lovelace', avatarUrl: null, abilities: { 'ichava.admin': false, 'ichava.manage-cache': false } };

/** The `ichava` Inertia prop's host fields. */
export function ichavaProp(over: Partial<Ichava> = {}): Partial<Ichava> {
  return {
    schemaVersion: '1.0.0',
    locale: 'en',
    modes: { inertia: true, api: true },
    features: manifest(),
    account: { login: 'https://app.test/login', logout: 'https://app.test/logout' },
    storage: { tier: 'database', persistent: true },
    perPage: 24,
    defaultTheme: 'light',
    ...over,
  };
}

/**
 * A REST map whose URLs share no prefix and follow no naming rule, as a host that
 * mounted its routes under its own names would send. A client that builds a URL from
 * another (a base plus a segment) misses every one of these.
 */
export const MAP = {
  'icons.list': 'https://app.test/v1-icons/listing',
  'icons.show': 'https://app.test/v1-icons/one/{iconId}',
  'icons.svg': 'https://app.test/v1-svg/{iconId}.svg',
  'icons.filters': 'https://app.test/v1-icons/facets',
  'icons.tree': 'https://app.test/v1-icons/folders',
  'icons.statistics': 'https://app.test/v1-icons/stats',
  'library.show': 'https://app.test/lib/everything',
  'library.destroy': 'https://app.test/lib/forget-me',
  'favorites.list': 'https://app.test/hearts',
  'favorites.add': 'https://app.test/hearts/{iconId}/on',
  'favorites.remove': 'https://app.test/hearts/{iconId}/off',
  'collections.list': 'https://app.test/sets',
  'collections.create': 'https://app.test/sets/new',
  'collections.rename': 'https://app.test/sets/{collectionId}/name',
  'collections.delete': 'https://app.test/sets/{collectionId}/drop',
  'collections.addIcon': 'https://app.test/sets/{collectionId}/with/{iconId}',
  'collections.removeIcon': 'https://app.test/sets/{collectionId}/without/{iconId}',
  'history.list': 'https://app.test/seen',
  'history.log': 'https://app.test/seen/log',
  'history.clear': 'https://app.test/seen/wipe',
  'commands.list': 'https://app.test/palette',
  'commands.log': 'https://app.test/palette/log',
  'commands.clear': 'https://app.test/palette/wipe',
  'preferences.show': 'https://app.test/prefs/read',
  'preferences.update': 'https://app.test/prefs/write',
  'preferences.reset': 'https://app.test/prefs/reset',
  status: 'https://app.test/admin/state',
} as const;

/** `GET {prefix}/api/v1/bootstrap` as icon-browser 1.2.0 serves it, with the REST map above. */
export function bootstrapDoc(over: Partial<Bootstrap> = {}): Bootstrap {
  return {
    schemaVersion: '1.2.0',
    locale: 'en',
    modes: { inertia: false, api: true },
    features: manifest(),
    session: { schemaVersion: '1.2.0', authenticated: true, user: ADA, tier: 'database', persistent: true, links: { login: null, logout: null } },
    api: { version: 'v1', base: 'https://app.test/v1-root', endpoints: { ...MAP } },
    ...over,
  };
}
