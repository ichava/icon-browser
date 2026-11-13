import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The persisted blob is user data. A refactor that renames, drops or reshapes a field
 * discards every user's settings on their next visit, with nothing reported.
 *
 * This hydrates a captured `ichava.browser.v2` blob (persist version 3), holding a
 * non-default value in every persisted field, and asserts the state field by field.
 * Then it asserts the store writes back exactly the same field list. The refactor in
 * .claude/design/react-ui/architecture.md moves the store into slices; this is what
 * proves no move changed what users have stored.
 */

const KEY = 'ichava.browser.fixture';

/** Every field `partialize` writes, in the order the store declares them. */
const PERSISTED_FIELDS = [
  'theme',
  'accent',
  'radius',
  'scale',
  'density',
  'reduceMotion',
  'showLabels',
  'adaptMonochrome',
  'filters',
  'view',
  'searchScope',
  'size',
  'sizeUnit',
  'gridStroke',
  'color',
  'treatment',
  'copyFormat',
  'favorites',
  'history',
  'collections',
  'auth',
  'authInitialized',
  'activeWorkspaceId',
  'notifications',
  'storageDriver',
  'tourSeen',
  'consent',
  'devtoolsLayout',
] as const;

/** A blob as a returning user's browser holds it. Every value differs from the default. */
const CAPTURED = {
  version: 3,
  state: {
    theme: 'dark',
    accent: '#7c3aed',
    radius: 4,
    scale: 'l',
    density: 'compact',
    reduceMotion: true,
    showLabels: false,
    adaptMonochrome: false,
    filters: {
      search: 'arrow',
      packages: ['ichava/icon-sets-tabler'],
      categories: ['arrows'],
      subs: ['arrows/circle'],
      variant: 'outline',
      sortBy: 'package',
      sortOrder: 'desc',
      page: 3,
      perPage: 96,
    },
    view: 'list',
    searchScope: 'packages',
    size: 40,
    sizeUnit: 'rem',
    gridStroke: 1.25,
    color: '#ff5500',
    treatment: 'duotone',
    copyFormat: 'react',
    favorites: [1204, 77],
    history: [{ id: 1204, action: 'copied', ts: 1761200000000 }],
    collections: [{ id: 'c-lx2k1', name: 'Toolbar', icons: [1204, 77] }],
    auth: { status: 'authed', user: { name: 'Ada Lovelace', initials: 'AL', email: 'ada@example.test', plan: 'PRO' } },
    authInitialized: true,
    activeWorkspaceId: 'ws-acme',
    notifications: [{ id: 'n1', icon: 'bell', text: 'Welcome back', ts: 1761200000000, read: true }],
    storageDriver: 'local',
    tourSeen: true,
    consent: 'essential',
    devtoolsLayout: { dock: 'right', size: 420 },
  },
};

/**
 * What version 5 holds after migrating the captured version 3 blob: everything as it was,
 * and the filters gain the top-level kind (icons) and empty tag and keyword filters. The
 * stored accent is kept as stored, even though it was the old default: nothing rewrites a
 * stored appearance value (forward only, 2026-11-05).
 */
const MIGRATED = {
  ...CAPTURED.state,
  filters: { ...CAPTURED.state.filters, kind: 'icon', tags: [], keywords: [] },
};

async function fresh() {
  vi.resetModules();
  return import('@/store');
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('persisted state (ichava.browser.v2, version 3 migrating to 5)', () => {
  it('the fixture covers every persisted field', () => {
    expect(Object.keys(CAPTURED.state)).toEqual([...PERSISTED_FIELDS]);
  });

  it('hydrates every field of a captured version 3 blob, filters gaining the kind', async () => {
    localStorage.setItem(KEY, JSON.stringify(CAPTURED));
    const { createBrowserStore } = await fresh();
    const store = createBrowserStore({ persistKey: KEY });
    await store.persist.rehydrate();

    const state = store.getState() as unknown as Record<string, unknown>;
    for (const field of PERSISTED_FIELDS) {
      expect({ field, value: state[field] }).toEqual({ field, value: MIGRATED[field] });
    }
  });

  it('writes back exactly the persisted field list, at version 5', async () => {
    localStorage.setItem(KEY, JSON.stringify(CAPTURED));
    const { createBrowserStore } = await fresh();
    const store = createBrowserStore({ persistKey: KEY });
    await store.persist.rehydrate();

    // Any action triggers a write; this one changes a field that is not persisted.
    store.getState().toggleSelect(1204);

    const written = JSON.parse(localStorage.getItem(KEY) ?? 'null') as typeof CAPTURED | null;
    expect(written).not.toBeNull();
    expect(written!.version).toBe(5);
    expect(Object.keys(written!.state)).toEqual([...PERSISTED_FIELDS]);
    expect(written!.state).toEqual(MIGRATED);
  });

  it('adopts the blob consent as the site-wide answer, keeping the per-mount field (A6-gaps G17)', async () => {
    localStorage.setItem(KEY, JSON.stringify(CAPTURED));
    const { createBrowserStore } = await fresh();
    const store = createBrowserStore({ persistKey: KEY });
    await store.persist.rehydrate();

    expect(localStorage.getItem('ichava.consent')).toBe(CAPTURED.state.consent);
    store.getState().toggleSelect(1204);
    const written = JSON.parse(localStorage.getItem(KEY) ?? 'null') as typeof CAPTURED | null;
    expect(written!.state.consent).toBe(CAPTURED.state.consent);
  });
});
