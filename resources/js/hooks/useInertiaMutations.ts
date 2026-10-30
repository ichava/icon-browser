import { router, usePage } from '@inertiajs/react';
import type { IconId } from '@/lib/browser';
import { HISTORY_VERBS } from '@/core/libraryDiff';
import type { IchavaShared } from '@/types';

/**
 * Server mutations for library state.
 *
 * Every writer goes to Laravel and the response refreshes the affected
 * props, which the hydration effects fold back into the store. Since the
 * port onto @ichava/react-icon-browser the browser changes its store first
 * and `useLibrarySync` replays the change here, so the reload confirms (or,
 * on a rejected write, reverts) what the user already sees.
 *
 * Client action verbs differ from the server enum (`viewed` vs `view`),
 * so history logging maps them here, at the single boundary, rather than
 * in every call site.
 *
 * Library writes are `async` visits: a synchronous Inertia visit cancels
 * the one in flight, so two quick toggles, or a toggle during a page
 * change, would drop a write.
 */

const LIBRARY_PROPS = ['favorites', 'collections', 'history', 'commandHistory'];

/**
 * Feedback props every mutation reload carries: the server answers
 * mutations with flash messages and validation redirects with errors,
 * and partial reloads omit anything not listed.
 */
const WITH_FEEDBACK = ['flash', 'errors'];

const LIBRARY_VISIT = { preserveState: true, preserveScroll: true, async: true } as const;

export function useInertiaMutations() {
  const { props } = usePage<{ ichava: IchavaShared }>();
  const routes = props.ichava.routes;
  // "Delete my library" is a feature endpoint (Inertia route first), not one of `routes`.
  const libraryDestroy = props.ichava.features?.library?.enabled ? props.ichava.features.library.endpoints.destroy ?? null : null;

  return {
    toggleFavorite: (id: IconId) =>
      router.post(`${routes.favorites}/${id}/toggle`, {}, { ...LIBRARY_VISIT, only: [...LIBRARY_PROPS, ...WITH_FEEDBACK] }),

    addFavorite: (id: IconId) =>
      router.post(`${routes.favorites}/${id}`, {}, { ...LIBRARY_VISIT, only: ['favorites', ...WITH_FEEDBACK] }),

    removeFavorite: (id: IconId) =>
      router.delete(`${routes.favorites}/${id}`, { ...LIBRARY_VISIT, only: ['favorites', ...WITH_FEEDBACK] }),

    pushHistory: (id: IconId, action: string) =>
      router.post(
        routes.history,
        { icon_id: id, action: HISTORY_VERBS[action] ?? action },
        { ...LIBRARY_VISIT, only: ['history', ...WITH_FEEDBACK] },
      ),

    logCommand: (command: string, type: 'action' | 'search' | 'navigation', metadata: Record<string, string | number | boolean | null> = {}) =>
      router.post(routes.commands, { command, type, metadata }, { preserveState: true, only: ['commandHistory', ...WITH_FEEDBACK] }),

    // The command palette's recents, cleared (`DELETE {prefix}/command-history`).
    clearCommands: () =>
      router.delete(routes.commands, { ...LIBRARY_VISIT, only: ['commandHistory', ...WITH_FEEDBACK] }),

    // "Delete my library": every favourite and collection, as one request. Nothing to send
    // when the host turned the library feature off.
    deleteLibrary: () => {
      if (!libraryDestroy) return;
      router.delete(libraryDestroy, { ...LIBRARY_VISIT, only: ['favorites', 'collections', ...WITH_FEEDBACK] });
    },

    // Was `preserveState: false`, which remounted the page and with it the browser and its
    // store. The reload of `collections` is all a new collection needs.
    createCollection: (name: string) =>
      router.post(routes.collections, { name }, { ...LIBRARY_VISIT, only: ['collections', ...WITH_FEEDBACK] }),

    updateCollection: (id: string, data: { name?: string; color?: string | null }) =>
      router.put(`${routes.collections}/${id}`, data, { ...LIBRARY_VISIT, only: ['collections', ...WITH_FEEDBACK] }),

    deleteCollection: (id: string) =>
      router.delete(`${routes.collections}/${id}`, { ...LIBRARY_VISIT, only: ['collections', ...WITH_FEEDBACK] }),

    addToCollection: (collectionId: string, iconId: IconId) =>
      router.post(`${routes.collections}/${collectionId}/icons/${iconId}`, {}, { ...LIBRARY_VISIT, only: ['collections', ...WITH_FEEDBACK] }),

    removeFromCollection: (collectionId: string, iconId: IconId) =>
      router.delete(`${routes.collections}/${collectionId}/icons/${iconId}`, { ...LIBRARY_VISIT, only: ['collections', ...WITH_FEEDBACK] }),

    clearHistory: () =>
      router.delete(routes.history, { ...LIBRARY_VISIT, only: ['history', ...WITH_FEEDBACK] }),

    clearCache: () =>
      router.post(routes.cache.clear, {}, { preserveState: true, only: ['cacheStats', 'cacheHealthy', ...WITH_FEEDBACK] }),

    rebuildCache: () =>
      router.post(routes.cache.rebuild, {}, { preserveState: true, only: ['cacheStats', 'cacheHealthy', ...WITH_FEEDBACK] }),
  };
}
