import { useEffect, useMemo, useState } from 'react';
import type { Icon, IconId } from '@ichava/js-ui-kernel';
import { useRepo } from '@/hooks/useRepo';

/**
 * Resolve saved icon ids (favorites, history, collections, selection) back into
 * full `Icon` records, in both modes.
 *
 * Eight call sites across `LibraryDialog`, `SharedCollectionsModal` and
 * `AppToolbar` used to do this inline as `ids.map(id => repo?.byId(id))` --
 * synchronous, and silently returning nothing once `repo` is `null` in REST
 * mode. One hook instead of eight copies of the same resolution logic, one of
 * which would inevitably have drifted from the others.
 *
 * All hooks below run on every render regardless of mode -- only the RETURNED
 * VALUE branches on `repo`. Branching the hook calls themselves (an early
 * `return` before `useEffect`) is a rules-of-hooks violation; eslint caught
 * exactly that on the first draft of this file, and a second draft's
 * `setState` synchronously inside the effect body (seeding a cache from
 * `page.items`) tripped `react-hooks/set-state-in-effect` -- the page index is
 * computed with `useMemo` now instead, so the effect only ever sets state for
 * ids it actually had to fetch.
 */
export function useResolvedIcons(ids: IconId[]): { icons: Icon[]; loading: boolean } {
  const { repo, client, page } = useRepo();
  // Every id a request settled for: the icon, or null when the request failed. Loading is
  // derived from it (an id neither on the page nor settled), so no state is set synchronously.
  const [fetched, setFetched] = useState<Map<IconId, Icon | null>>(new Map());

  // Free, no request: whatever's already on the current page.
  const pageIndex = useMemo(() => new Map(page.items.map((i) => [i.id, i] as const)), [page.items]);

  useEffect(() => {
    // Static mode resolves synchronously below; no client yet means nothing to fetch.
    if (repo || !client) return;

    const missing = ids.filter((id) => !pageIndex.has(id) && !fetched.has(id));
    if (missing.length === 0) return;

    const controller = new AbortController();
    Promise.all(missing.map((id) => client.getIcon(id, controller.signal).catch(() => null)))
      .then((results) => {
        if (controller.signal.aborted) return;
        setFetched((prev) => {
          const next = new Map(prev);
          results.forEach((icon, i) => next.set(missing[i]!, icon));
          return next;
        });
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the id list's content, not identity
  }, [repo, client, JSON.stringify(ids), pageIndex]);

  if (repo) {
    return { icons: ids.map((id) => repo.byId(id)).filter((i): i is Icon => Boolean(i)), loading: false };
  }

  return {
    icons: ids.map((id) => pageIndex.get(id) ?? fetched.get(id)).filter((i): i is Icon => Boolean(i)),
    loading: Boolean(client) && ids.some((id) => !pageIndex.has(id) && !fetched.has(id)),
  };
}
