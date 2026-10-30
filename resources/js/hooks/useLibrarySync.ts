import { useEffect, useRef, useLayoutEffect } from 'react';
import type { BrowserStoreHook } from '@/lib/browser';
import { isHydrating } from '@/core/browserMount';
import { diffLibrary, type LibraryOp, type LibraryView } from '@/core/libraryDiff';
import type { useInertiaMutations } from '@/hooks/useInertiaMutations';

type Mutations = ReturnType<typeof useInertiaMutations>;

/** One store change, as the Inertia route that records it. */
export function runLibraryOp(m: Mutations, op: LibraryOp): void {
  switch (op.kind) {
    case 'favorite.add':
      m.addFavorite(op.iconId);
      return;
    case 'favorite.remove':
      m.removeFavorite(op.iconId);
      return;
    case 'history.record':
      m.pushHistory(op.iconId, op.action);
      return;
    case 'history.clear':
      m.clearHistory();
      return;
    case 'collection.create':
      m.createCollection(op.name);
      return;
    case 'collection.rename':
      m.updateCollection(op.id, { name: op.name });
      return;
    case 'collection.delete':
      m.deleteCollection(op.id);
      return;
    case 'collection.add':
      m.addToCollection(op.id, op.iconId);
      return;
    case 'collection.remove':
      m.removeFromCollection(op.id, op.iconId);
      return;
    case 'command.log':
      m.logCommand(op.command, 'action');
      return;
    case 'command.clear':
      m.clearCommands();
      return;
    case 'library.delete':
      m.deleteLibrary();
      return;
  }
}

/**
 * The operations to send for one store change. A collection created in this change has
 * only the browser's provisional id until the reload brings the server's, so the icons the
 * diff adds to it are not sent: the collection is created empty, as it always was here.
 */
export function libraryOps(prev: LibraryView, next: LibraryView): LibraryOp[] {
  const ops = diffLibrary(prev, next);
  const created = new Set(ops.flatMap((op) => (op.kind === 'collection.create' ? [op.id] : [])));
  if (!created.size) return ops;
  return ops.filter((op) => !((op.kind === 'collection.add' || op.kind === 'collection.remove') && created.has(op.id)));
}

/**
 * Replay the browser's library changes against the server: favourites, history,
 * collections, command-palette recents and "Delete my library".
 *
 * The browser (react-icon-browser) changes favourites, history and collections in its own
 * store; it knows nothing about Laravel. This subscribes to the mount's store and sends each
 * change to the Inertia route that records it. The reload that answers brings the server's
 * state back through `useInertiaCatalog`, which replaces the store's, so a write the server
 * refuses is undone rather than left showing. Writes made by that hydration are not sent back.
 */
export function useLibrarySync(store: BrowserStoreHook, mutations: Mutations): void {
  const latest = useRef(mutations);
  // Kept current after each render rather than during it: writing a ref while rendering
  // is unsafe under concurrent rendering (react-hooks/refs). The subscriber reads it only
  // when the store changes, which is always after a commit.
  useLayoutEffect(() => {
    latest.current = mutations;
  });

  useEffect(
    () =>
      store.subscribe((next, prev) => {
        if (isHydrating(store)) return;
        for (const op of libraryOps(prev, next)) runLibraryOp(latest.current, op);
      }),
    [store],
  );
}
