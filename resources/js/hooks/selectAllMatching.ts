import type { StoreApi } from 'zustand';

import { StaticCatalog, type IconCatalog } from '@/core/api/ApiClient';
import { translateFor } from '@/core/i18n';
import { matchingIconIds, type IconFilters } from '@/modules/catalog';
import { toListParams, type BrowserStore } from '@/store';

/** Nothing narrows the listing: no search, category, subcategory or variant. */
function unfiltered(f: IconFilters): boolean {
  return f.search.trim() === '' && f.categories.length === 0 && f.subs.length === 0 && f.variant === null;
}

/**
 * Select every icon matching the current filter (Ctrl+A and the palette's "Select all
 * matching"), through the catalog layer: the mount's explicit client in REST mode, the
 * bundled catalog otherwise.
 *
 * An unfiltered select all against a REST client pages through the whole listing, so it
 * asks first, "Select all N icons?", with N from the API's total and formatted for the
 * locale (Sim's decision). A failed listing leaves the selection as it was.
 */
export function selectAllMatching(api: StoreApi<BrowserStore>, client: IconCatalog | null): void {
  const s = api.getState();
  const source = client ?? (s.catalog ? new StaticCatalog(s.catalog) : null);
  if (!source) return;
  const params = toListParams(s.filters);
  // Paging a large listing can take a while: past two seconds the task loader says so.
  const run = () =>
    void api
      .getState()
      .runTask(translateFor(api.getState(), 'task.selectAll'), () => matchingIconIds(source, params))
      .then((ids) => api.getState().setSelection(ids))
      .catch(() => {
        /* the listing failed; the selection is left as it was */
      });

  if (!client || !unfiltered(s.filters)) {
    run();
    return;
  }
  void source
    .listIcons({ ...params, page: 1, perPage: 1 })
    .then(({ total }) => {
      const st = api.getState();
      const locale = st.locale;
      const t = (key: string, vars?: Record<string, string | number>) => translateFor(st, key, vars);
      api.getState().openConfirm({
        title: t('selectAll.confirmTitle', { n: new Intl.NumberFormat(locale).format(total) }),
        body: t('selectAll.confirmBody'),
        confirmLabel: t('selectAll.confirmLabel'),
        onConfirm: run,
      });
    })
    .catch(() => {
      /* the count failed; nothing is selected */
    });
}
