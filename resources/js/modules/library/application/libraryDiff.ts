import type { IconId } from '@ichava/js-ui-kernel';
import type { Collection, HistoryEntry } from '../domain/Library';

/**
 * The library as a server keeps it: favourites, history, collections, command-palette
 * recents, and the count of "Delete my library" requests.
 *
 * The browser changes these in its own store (the Library aggregate). Inside a host the
 * server is the record, so every change is replayed against it; this file is the pure
 * half, what changed between two states as the operations the server understands. The
 * Inertia host (icon-browser) and the REST sync in this package replay the same list.
 */
export interface LibraryView {
  favorites: readonly IconId[];
  history: readonly HistoryEntry[];
  collections: readonly Collection[];
  recentCommands?: readonly string[];
  libraryDeletions?: number;
}

export type LibraryOp =
  | { kind: 'favorite.add'; iconId: IconId }
  | { kind: 'favorite.remove'; iconId: IconId }
  | { kind: 'history.record'; iconId: IconId; action: string }
  | { kind: 'history.clear' }
  /**
   * A new collection under its provisional `id`, with the icons it was created holding.
   * `diffLibrary` always sets `icons`; it is optional so an operation built before it
   * existed still type-checks, and means none.
   */
  | { kind: 'collection.create'; id: string; name: string; icons?: readonly IconId[] }
  | { kind: 'collection.rename'; id: string; name: string }
  | { kind: 'collection.delete'; id: string }
  | { kind: 'collection.add'; id: string; iconId: IconId }
  | { kind: 'collection.remove'; id: string; iconId: IconId }
  | { kind: 'command.log'; command: string }
  | { kind: 'command.clear' }
  | { kind: 'library.delete' };

/** Client history verbs to the server's (`RecordHistory::ACTIONS`: view, copy, download). */
export const HISTORY_VERBS: Readonly<Record<string, string>> = { viewed: 'view', copied: 'copy', downloaded: 'download' };

/** The server's verbs back to the client's, so a hydrated entry dedupes with a new one. */
export const CLIENT_VERBS: Readonly<Record<string, string>> = { view: 'viewed', copy: 'copied', download: 'downloaded' };

const entryKey = (h: HistoryEntry) => `${h.id}:${h.action}:${h.ts}`;

export function diffLibrary(prev: LibraryView, next: LibraryView): LibraryOp[] {
  const ops: LibraryOp[] = [];
  // "Delete my library" is one server call; the favourites and collections it emptied
  // are not also deleted one by one.
  const deleted = (next.libraryDeletions ?? 0) > (prev.libraryDeletions ?? 0);
  if (deleted) ops.push({ kind: 'library.delete' });

  if (prev.favorites !== next.favorites) {
    const before = new Set(prev.favorites);
    const after = new Set(next.favorites);
    for (const id of after) if (!before.has(id)) ops.push({ kind: 'favorite.add', iconId: id });
    if (!deleted) for (const id of before) if (!after.has(id)) ops.push({ kind: 'favorite.remove', iconId: id });
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
        // Created under its provisional id, with its icons, in one operation: the server
        // assigns the real id, so an icon sent separately would name a collection it does
        // not know yet.
        ops.push({ kind: 'collection.create', id, name: c.name, icons: [...c.icons] });
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
    if (!deleted) for (const id of before.keys()) if (!after.has(id)) ops.push({ kind: 'collection.delete', id });
  }

  const pc = prev.recentCommands ?? [];
  const nc = next.recentCommands ?? [];
  if (pc !== nc) {
    if (nc.length === 0 && pc.length > 0) ops.push({ kind: 'command.clear' });
    else if (nc[0] !== undefined && (nc[0] !== pc[0] || nc.length !== pc.length || nc.some((c, i) => c !== pc[i]))) {
      // Recents move the command run to the front; that one is what happened.
      ops.push({ kind: 'command.log', command: nc[0] });
    }
  }

  return ops;
}
