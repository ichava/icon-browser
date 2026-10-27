import type { Icon, IconId } from '@ichava/js-ui-kernel';
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
export declare function useResolvedIcons(ids: IconId[]): {
    icons: Icon[];
    loading: boolean;
};
