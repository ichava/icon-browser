import { describe, expect, it } from 'vitest';

import { Library, type LibraryState } from './Library';

const state = (): LibraryState => ({
  favorites: [1, 2],
  history: [{ id: 1, action: 'viewed', ts: 10 }],
  collections: [{ id: 'c1', name: 'Toolbar', icons: [1] }],
});
const lib = (s = state(), historyCap = 3) => Library.from(s, { historyCap });

describe('Library', () => {
  it('toggles a favourite, adding new ones to the front', () => {
    expect(lib().toggleFavorite(3).favorites).toEqual([3, 1, 2]);
    expect(lib().toggleFavorite(1).favorites).toEqual([2]);
  });

  it('records history newest first, once per icon and action, capped', () => {
    const l = lib().record(2, 'copied', 20).record(1, 'viewed', 30).record(3, 'copied', 40).record(4, 'copied', 50);
    expect(l.history).toEqual([
      { id: 4, action: 'copied', ts: 50 },
      { id: 3, action: 'copied', ts: 40 },
      { id: 1, action: 'viewed', ts: 30 },
    ]);
    expect(lib().clearHistory().history).toEqual([]);
  });

  it('creates collections only with a non-blank name, asking for an id only then', () => {
    let calls = 0;
    const newId = () => `c${++calls}`;
    const base = lib();
    expect(base.createCollection('   ', newId)).toBe(base);
    expect(calls).toBe(0);
    expect(base.createCollection('  Brand  ', newId).collections.at(-1)).toEqual({ id: 'c1', name: 'Brand', icons: [] });
  });

  it('creates a collection holding the icons it was made from, each once', () => {
    expect(lib().createCollection('Brand', () => 'c2', [4, 2, 4]).collections.at(-1)).toEqual({ id: 'c2', name: 'Brand', icons: [4, 2] });
  });

  it('renames, keeping the name for a blank one, and removes', () => {
    expect(lib().renameCollection('c1', ' Header ').collections[0]!.name).toBe('Header');
    expect(lib().renameCollection('c1', '  ').collections[0]!.name).toBe('Toolbar');
    expect(lib().removeCollection('c1').collections).toEqual([]);
  });

  it('never holds an icon twice in a collection', () => {
    expect(lib().addTo('c1', 1).collections[0]!.icons).toEqual([1]);
    expect(lib().addTo('c1', 2).collections[0]!.icons).toEqual([1, 2]);
    expect(lib().removeFrom('c1', 1).collections[0]!.icons).toEqual([]);
  });

  it('shares a collection with a role and teammates', () => {
    const sharedWith = [{ initials: 'AL', name: 'Ada Lovelace' }];
    expect(lib().share('c1', { role: 'viewer', sharedWith }).collections[0]).toMatchObject({ shared: true, role: 'viewer', sharedWith });
  });

  it('is immutable, and keeps the identity of the parts a change did not touch', () => {
    const s = state();
    const a = lib(s);
    const b = a.toggleFavorite(9);
    expect(a.favorites).toEqual([1, 2]);
    expect(b.history).toBe(s.history);
    expect(b.collections).toBe(s.collections);
    expect(Object.isFrozen(b)).toBe(true);
  });
});
