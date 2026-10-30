import { describe, expect, it } from 'vitest';
import { diffLibrary, type LibraryView } from './libraryDiff';

const view = (overrides: Partial<LibraryView> = {}): LibraryView => ({ favorites: [], history: [], collections: [], ...overrides });

describe('diffLibrary', () => {
  it('reports nothing when nothing moved', () => {
    const v = view({ favorites: [1] });
    expect(diffLibrary(v, v)).toEqual([]);
  });

  it('turns favourite changes into adds and removes', () => {
    expect(diffLibrary(view({ favorites: [1, 2] }), view({ favorites: [2, 3] }))).toEqual([
      { kind: 'favorite.add', iconId: 3 },
      { kind: 'favorite.remove', iconId: 1 },
    ]);
  });

  it('records new history entries oldest first, and an emptied history as a clear', () => {
    const old = { id: 1, action: 'viewed', ts: 10 };
    const next = [
      { id: 3, action: 'copied', ts: 30 },
      { id: 2, action: 'viewed', ts: 20 },
      old,
    ];
    expect(diffLibrary(view({ history: [old] }), view({ history: next }))).toEqual([
      { kind: 'history.record', iconId: 2, action: 'viewed' },
      { kind: 'history.record', iconId: 3, action: 'copied' },
    ]);
    expect(diffLibrary(view({ history: [old] }), view({ history: [] }))).toEqual([{ kind: 'history.clear' }]);
  });

  it('turns collection changes into creates, renames, icon moves and deletes', () => {
    const before = view({
      collections: [
        { id: '1', name: 'UI', icons: [1, 2] },
        { id: '2', name: 'Old', icons: [] },
      ],
    });
    const after = view({
      collections: [
        { id: '1', name: 'Interface', icons: [2, 5] },
        { id: 'c-new', name: 'Brand', icons: [] },
      ],
    });
    expect(diffLibrary(before, after)).toEqual([
      { kind: 'collection.rename', id: '1', name: 'Interface' },
      { kind: 'collection.add', id: '1', iconId: 5 },
      { kind: 'collection.remove', id: '1', iconId: 1 },
      // react-icon-browser's diff names the provisional id the collection was created under.
      { kind: 'collection.create', id: 'c-new', name: 'Brand' },
      { kind: 'collection.delete', id: '2' },
    ]);
  });
});

describe('diffLibrary, from react-icon-browser', () => {
  it('reports command recents and "Delete my library"', () => {
    expect(diffLibrary(view({ recentCommands: [] }), view({ recentCommands: ['theme'] }))).toEqual([{ kind: 'command.log', command: 'theme' }]);
    expect(diffLibrary(view({ recentCommands: ['theme'] }), view({ recentCommands: [] }))).toEqual([{ kind: 'command.clear' }]);
    const full = view({ favorites: [1], collections: [{ id: '5', name: 'UI', icons: [1] }], libraryDeletions: 0 });
    expect(diffLibrary(full, view({ libraryDeletions: 1 }))).toEqual([{ kind: 'library.delete' }]);
  });
});
