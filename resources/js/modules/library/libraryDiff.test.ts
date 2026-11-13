import { describe, expect, it } from 'vitest';
import { diffLibrary, RestLibrary, type LibraryView } from '@/modules/library';
import { HttpTransport } from '@/modules/catalog';
import { RestPreferences } from '@/modules/preferences';
import { MAP } from '@/test/hostFixtures';

const empty: LibraryView = { favorites: [], history: [], collections: [], recentCommands: [], libraryDeletions: 0 };

describe('diffLibrary', () => {
  it('sends "Delete my library" once instead of a delete per favourite and collection', () => {
    const prev: LibraryView = { ...empty, favorites: [1, 2], collections: [{ id: 'c1', name: 'A', icons: [1] }] };
    const next: LibraryView = { ...prev, favorites: [], collections: [], libraryDeletions: 1 };
    expect(diffLibrary(prev, next)).toEqual([{ kind: 'library.delete' }]);
  });

  it('records the command run, and a clear', () => {
    expect(diffLibrary(empty, { ...empty, recentCommands: ['theme'] })).toEqual([{ kind: 'command.log', command: 'theme' }]);
    expect(diffLibrary({ ...empty, recentCommands: ['a', 'b'] }, { ...empty, recentCommands: ['b', 'a'] })).toEqual([{ kind: 'command.log', command: 'b' }]);
    expect(diffLibrary({ ...empty, recentCommands: ['a'] }, { ...empty, recentCommands: [] })).toEqual([{ kind: 'command.clear' }]);
  });

  it('creates a collection under its provisional id, carrying the icons it starts with', () => {
    const next: LibraryView = { ...empty, collections: [{ id: 'c-tmp', name: 'Toolbar', icons: [5, 9] }] };
    expect(diffLibrary(empty, next)).toEqual([{ kind: 'collection.create', id: 'c-tmp', name: 'Toolbar', icons: [5, 9] }]);
  });

  it('creates an empty collection with no icons', () => {
    const next: LibraryView = { ...empty, collections: [{ id: 'c-tmp', name: 'Toolbar', icons: [] }] };
    expect(diffLibrary(empty, next)).toEqual([{ kind: 'collection.create', id: 'c-tmp', name: 'Toolbar', icons: [] }]);
  });
});

/** A transport that records requests and answers from a script. */
function recording(answers: Record<string, unknown> = {}) {
  const calls: { url: string; method: string; body?: unknown }[] = [];
  const transport = new HttpTransport();
  transport.request = (async (url: string, opts: { method?: string; body?: unknown } = {}) => {
    calls.push({ url, method: opts.method ?? 'GET', ...(opts.body !== undefined ? { body: opts.body } : {}) });
    return answers[`${opts.method ?? 'GET'} ${url}`] ?? { success: true, data: {} };
  }) as HttpTransport['request'];
  return { calls, transport };
}

const API = 'https://app.test/ichava/api/v1';
const endpoints = { library: `${API}/library`, favorites: `${API}/favorites`, collections: `${API}/collections`, history: `${API}/history`, commands: `${API}/command-history` };

describe('RestLibrary', () => {
  it('loads the library into the store shapes', async () => {
    const { transport } = recording({
      [`GET ${API}/library`]: {
        success: true,
        data: {
          favorites: [3, 1],
          collections: [{ id: 'abc', name: 'Toolbar', icon_ids: [3] }],
          history: [{ icon_id: 3, action: 'copy', timestamp: '2026-10-30T10:00:00Z' }],
          commandHistory: [{ command: 'theme', type: 'action', timestamp: '2026-10-30T10:00:00Z' }],
        },
      },
    });
    const lib = await new RestLibrary(endpoints, transport).load();
    expect(lib).toEqual({
      favorites: [3, 1],
      collections: [{ id: 'abc', name: 'Toolbar', icons: [3] }],
      history: [{ id: 3, action: 'copied', ts: Date.parse('2026-10-30T10:00:00Z') }],
      recentCommands: ['theme'],
    });
  });

  it('sends each operation to its REST route, following the id the server assigned', async () => {
    const { calls, transport } = recording({ [`POST ${API}/collections`]: { success: true, data: { id: 'srv-9' } } });
    const lib = new RestLibrary(endpoints, transport);
    await lib.apply({ kind: 'favorite.add', iconId: 7 });
    await lib.apply({ kind: 'favorite.remove', iconId: 7 });
    expect(await lib.apply({ kind: 'collection.create', id: 'c-tmp', name: 'Toolbar', icons: [] })).toEqual({ from: 'c-tmp', to: 'srv-9' });
    await lib.apply({ kind: 'collection.add', id: 'c-tmp', iconId: 7 });
    await lib.apply({ kind: 'collection.rename', id: 'c-tmp', name: 'Bar' });
    await lib.apply({ kind: 'history.record', iconId: 7, action: 'downloaded' });
    await lib.apply({ kind: 'command.log', command: 'theme' });
    await lib.apply({ kind: 'library.delete' });
    expect(calls).toEqual([
      { url: `${API}/favorites/7`, method: 'POST' },
      { url: `${API}/favorites/7`, method: 'DELETE' },
      { url: `${API}/collections`, method: 'POST', body: { name: 'Toolbar' } },
      { url: `${API}/collections/srv-9/icons/7`, method: 'POST' },
      { url: `${API}/collections/srv-9`, method: 'PUT', body: { name: 'Bar' } },
      { url: `${API}/history`, method: 'POST', body: { icon_id: 7, action: 'download' } },
      { url: `${API}/command-history`, method: 'POST', body: { command: 'theme', type: 'action' } },
      { url: `${API}/library`, method: 'DELETE' },
    ]);
  });

  it('creates a collection with its icons in one request', async () => {
    const { calls, transport } = recording({ [`POST ${API}/collections`]: { success: true, data: { id: 'srv-9', icon_ids: [7, 8] } } });
    const lib = new RestLibrary(endpoints, transport);
    expect(await lib.apply({ kind: 'collection.create', id: 'c-tmp', name: 'Toolbar', icons: [7, 8] })).toEqual({ from: 'c-tmp', to: 'srv-9' });
    expect(calls).toEqual([{ url: `${API}/collections`, method: 'POST', body: { name: 'Toolbar', icon_ids: [7, 8] } }]);
  });

  it('adds an icon the created collection came back without, for a host that predates icon_ids', async () => {
    const { calls, transport } = recording({ [`POST ${API}/collections`]: { success: true, data: { id: 'srv-9', icon_ids: [] } } });
    await new RestLibrary(endpoints, transport).apply({ kind: 'collection.create', id: 'c-tmp', name: 'Toolbar', icons: [7] });
    expect(calls).toEqual([
      { url: `${API}/collections`, method: 'POST', body: { name: 'Toolbar', icon_ids: [7] } },
      { url: `${API}/collections/srv-9/icons/7`, method: 'POST' },
    ]);
  });

  it('skips a feature the host turned off', async () => {
    const { calls, transport } = recording();
    await new RestLibrary({ ...endpoints, history: null }, transport).apply({ kind: 'history.clear' });
    expect(calls).toEqual([]);
  });
});

describe('RestLibrary, given the host REST map', () => {
  const mapped = {
    library: MAP['library.show'],
    favorites: MAP['favorites.list'],
    collections: MAP['collections.list'],
    history: MAP['history.list'],
    commands: MAP['commands.list'],
    api: MAP,
  };

  it('sends each operation to the route the map names, filling its placeholders', async () => {
    const { calls, transport } = recording({ [`POST ${MAP['collections.create']}`]: { success: true, data: { id: 'srv-9' } } });
    const lib = new RestLibrary(mapped, transport);
    await lib.load();
    await lib.apply({ kind: 'favorite.add', iconId: 7 });
    await lib.apply({ kind: 'favorite.remove', iconId: 7 });
    expect(await lib.apply({ kind: 'collection.create', id: 'c-tmp', name: 'Toolbar', icons: [] })).toEqual({ from: 'c-tmp', to: 'srv-9' });
    await lib.apply({ kind: 'collection.add', id: 'c-tmp', iconId: 7 });
    await lib.apply({ kind: 'collection.remove', id: 'c-tmp', iconId: 7 });
    await lib.apply({ kind: 'collection.rename', id: 'c-tmp', name: 'Bar' });
    await lib.apply({ kind: 'collection.delete', id: 'c-tmp' });
    await lib.apply({ kind: 'history.record', iconId: 7, action: 'copied' });
    await lib.apply({ kind: 'history.clear' });
    await lib.apply({ kind: 'command.log', command: 'theme' });
    await lib.apply({ kind: 'command.clear' });
    await lib.apply({ kind: 'library.delete' });
    expect(calls).toEqual([
      { url: 'https://app.test/lib/everything', method: 'GET' },
      { url: 'https://app.test/hearts/7/on', method: 'POST' },
      { url: 'https://app.test/hearts/7/off', method: 'DELETE' },
      { url: 'https://app.test/sets/new', method: 'POST', body: { name: 'Toolbar' } },
      { url: 'https://app.test/sets/srv-9/with/7', method: 'POST' },
      { url: 'https://app.test/sets/srv-9/without/7', method: 'DELETE' },
      { url: 'https://app.test/sets/srv-9/name', method: 'PUT', body: { name: 'Bar' } },
      { url: 'https://app.test/sets/srv-9/drop', method: 'DELETE' },
      { url: 'https://app.test/seen/log', method: 'POST', body: { icon_id: 7, action: 'copy' } },
      { url: 'https://app.test/seen/wipe', method: 'DELETE' },
      { url: 'https://app.test/palette/log', method: 'POST', body: { command: 'theme', type: 'action' } },
      { url: 'https://app.test/palette/wipe', method: 'DELETE' },
      { url: 'https://app.test/lib/forget-me', method: 'DELETE' },
    ]);
  });

  it('creates a collection with its icons at the route the map names', async () => {
    const { calls, transport } = recording({ [`POST ${MAP['collections.create']}`]: { success: true, data: { id: 'srv-9', icon_ids: [7] } } });
    const lib = new RestLibrary(mapped, transport);
    expect(await lib.apply({ kind: 'collection.create', id: 'c-tmp', name: 'Toolbar', icons: [7, 8] })).toEqual({ from: 'c-tmp', to: 'srv-9' });
    expect(calls).toEqual([
      { url: 'https://app.test/sets/new', method: 'POST', body: { name: 'Toolbar', icon_ids: [7, 8] } },
      { url: 'https://app.test/sets/srv-9/with/8', method: 'POST' },
    ]);
  });

  it('skips an operation whose route the map does not list', async () => {
    const { calls, transport } = recording();
    const { 'favorites.add': _add, 'library.destroy': _destroy, ...rest } = MAP;
    const lib = new RestLibrary({ ...mapped, api: rest }, transport);
    await lib.apply({ kind: 'favorite.add', iconId: 7 });
    await lib.apply({ kind: 'library.delete' });
    expect(calls).toEqual([]);
  });
});

describe('RestPreferences, given the host REST map', () => {
  it('reads, writes and resets at their own routes', async () => {
    const { calls, transport } = recording({ [`GET ${MAP['preferences.show']}`]: { success: true, data: { preferences: { view_mode: 'list' } } } });
    const prefs = RestPreferences.withEndpoints({ show: MAP['preferences.show'], update: MAP['preferences.update'], reset: MAP['preferences.reset'] }, transport);
    expect(await prefs.load()).toEqual({ view: 'list' });
    await prefs.save({ view: 'grid' });
    await prefs.reset();
    expect(calls).toEqual([
      { url: 'https://app.test/prefs/read', method: 'GET' },
      { url: 'https://app.test/prefs/write', method: 'POST', body: { preferences: { view_mode: 'grid' } } },
      { url: 'https://app.test/prefs/reset', method: 'DELETE' },
    ]);
  });

  it('skips a route the host did not mount', async () => {
    const { calls, transport } = recording();
    const prefs = RestPreferences.withEndpoints({ show: null, update: null, reset: null }, transport);
    expect(await prefs.load()).toEqual({});
    await prefs.save({ view: 'grid' });
    await prefs.reset();
    expect(calls).toEqual([]);
  });
});
