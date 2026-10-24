import type { Collection, HistoryEntry, IconId } from '@/lib/browser';

/**
 * Library state as the server keeps it: favourites, history and collections.
 *
 * The browser keeps these in its store and changes them in place (the Library aggregate in
 * @ichava/react-icon-browser). In this package the server is the record, so every change the
 * store makes is replayed against the Inertia routes, and every reload's props are written
 * back over the store. This file is the pure half: what changed between two states, as the
 * operations the server understands.
 */
export interface LibraryView {
  favorites: readonly IconId[];
  history: readonly HistoryEntry[];
  collections: readonly Collection[];
}

export type LibraryOp =
  | { kind: 'favorite.add'; iconId: IconId }
  | { kind: 'favorite.remove'; iconId: IconId }
  | { kind: 'history.record'; iconId: IconId; action: string }
  | { kind: 'history.clear' }
  | { kind: 'collection.create'; name: string }
  | { kind: 'collection.rename'; id: string; name: string }
  | { kind: 'collection.delete'; id: string }
  | { kind: 'collection.add'; id: string; iconId: IconId }
  | { kind: 'collection.remove'; id: string; iconId: IconId };

/** Client history verbs to the server's (`HistoryController`: `in:view,copy,download`). */
export const HISTORY_VERBS: Readonly<Record<string, string>> = { viewed: 'view', copied: 'copy', downloaded: 'download' };

/** The server's verbs back to the client's, so a hydrated entry dedupes with a new one. */
export const CLIENT_VERBS: Readonly<Record<string, string>> = { view: 'viewed', copy: 'copied', download: 'downloaded' };

const entryKey = (h: HistoryEntry) => `${h.id}:${h.action}:${h.ts}`;

export function diffLibrary(prev: LibraryView, next: LibraryView): LibraryOp[] {
  const ops: LibraryOp[] = [];

  if (prev.favorites !== next.favorites) {
    const before = new Set(prev.favorites);
    const after = new Set(next.favorites);
    for (const id of after) if (!before.has(id)) ops.push({ kind: 'favorite.add', iconId: id });
    for (const id of before) if (!after.has(id)) ops.push({ kind: 'favorite.remove', iconId: id });
  }

  if (prev.history !== next.history) {
    if (next.history.length === 0 && prev.history.length > 0) {
      ops.push({ kind: 'history.clear' });
    } else {
      const before = new Set(prev.history.map(entryKey));
      // Oldest first, so the server records them in the order they happened.
      for (const h of [...next.history].reverse()) {
        if (!before.has(entryKey(h))) ops.push({ kind: 'history.record', iconId: h.id, action: h.action });
      }
    }
  }

  if (prev.collections !== next.collections) {
    const before = new Map(prev.collections.map((c) => [c.id, c]));
    const after = new Map(next.collections.map((c) => [c.id, c]));
    for (const [id, c] of after) {
      const old = before.get(id);
      if (!old) {
        // A new collection is created empty; the server assigns its id, and the reload that
        // follows replaces the client's provisional one.
        ops.push({ kind: 'collection.create', name: c.name });
        continue;
      }
      if (old.name !== c.name) ops.push({ kind: 'collection.rename', id, name: c.name });
      if (old.icons !== c.icons) {
        const had = new Set(old.icons);
        const has = new Set(c.icons);
        for (const iconId of has) if (!had.has(iconId)) ops.push({ kind: 'collection.add', id, iconId });
        for (const iconId of had) if (!has.has(iconId)) ops.push({ kind: 'collection.remove', id, iconId });
      }
    }
    for (const id of before.keys()) if (!after.has(id)) ops.push({ kind: 'collection.delete', id });
  }

  return ops;
}
