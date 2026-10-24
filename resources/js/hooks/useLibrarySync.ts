import { useEffect, useRef } from 'react';
import type { BrowserStoreHook } from '@/lib/browser';
import { isHydrating } from '@/core/browserMount';
import { diffLibrary, type LibraryOp } from '@/core/libraryDiff';
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
  }
}

/**
 * Replay the browser's library changes against the server.
 *
 * The browser (react-icon-browser) changes favourites, history and collections in its own
 * store; it knows nothing about Laravel. This subscribes to the mount's store and sends each
 * change to the Inertia route that records it. The reload that answers brings the server's
 * state back through `useInertiaCatalog`, which replaces the store's, so a write the server
 * refuses is undone rather than left showing. Writes made by that hydration are not sent back.
 */
export function useLibrarySync(store: BrowserStoreHook, mutations: Mutations): void {
  const latest = useRef(mutations);
  latest.current = mutations;

  useEffect(
    () =>
      store.subscribe((next, prev) => {
        if (isHydrating(store)) return;
        for (const op of diffLibrary(prev, next)) runLibraryOp(latest.current, op);
      }),
    [store],
  );
}
