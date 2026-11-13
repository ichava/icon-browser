// The filter state and the browse chrome around it: view, sidebar, category tree expansion.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import { IconQuery } from '@/modules/catalog';
import { DEFAULT_FILTERS } from '@/core/defaults';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type BrowseSlice = Pick<
  BrowserStore,
  'filters'
  | 'view'
  | 'catQ'
  | 'collapsedGroups'
  | 'expandedCats'
  | 'searchScope'
  | 'packageQuery'
  | 'sidebarOpen'
  | 'setSearchScope'
  | 'setPackageQuery'
  | 'toggleSidebar'
  | 'setSidebarOpen'
  | 'setSearch'
  | 'clearSearch'
  | 'togglePackage'
  | 'selectAllPacks'
  | 'clearPacks'
  | 'toggleCat'
  | 'toggleSub'
  | 'clearCats'
  | 'setVariant'
  | 'setSort'
  | 'toggleOrder'
  | 'setPage'
  | 'nextPage'
  | 'prevPage'
  | 'setPerPage'
  | 'setView'
  | 'setCatQ'
  | 'toggleGroup'
  | 'toggleCatExpand'
  | 'toggleExpandAll'
  | 'resetFilters'
  | 'setKind'
  | 'toggleTag'
  | 'toggleKeyword'
  | 'clearTerms'
>;

export function browseSlice(set: SetState, _get: GetState): BrowseSlice {
  return {
    filters: DEFAULT_FILTERS,
    view: 'grid',
    catQ: '',
    collapsedGroups: [],
    expandedCats: [],
    searchScope: 'icons',
    packageQuery: '',
    sidebarOpen: false,
    setSearchScope: (sc) => set({ searchScope: sc }),
    setPackageQuery: (v) => set({ packageQuery: v }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (v) => set({ sidebarOpen: v }),
    // Filter transitions are IconQuery's (modules/catalog); the store only applies them.
    setSearch: (v) => set((s) => ({ filters: IconQuery.from(s.filters).search(v).toFilters() })),
    clearSearch: () => set((s) => ({ filters: IconQuery.from(s.filters).clearSearch().toFilters() })),
    togglePackage: (id) => set((s) => ({ filters: IconQuery.from(s.filters).togglePackage(id).toFilters() })),
    selectAllPacks: (all) => set((s) => ({ filters: IconQuery.from(s.filters).selectAllPacks(all).toFilters() })),
    clearPacks: () => set((s) => ({ filters: IconQuery.from(s.filters).clearPacks().toFilters() })),
    toggleCat: (name) => set((s) => ({ filters: IconQuery.from(s.filters).toggleCategory(name).toFilters() })),
    toggleSub: (category, sub) => set((s) => ({ filters: IconQuery.from(s.filters).toggleSub(category, sub).toFilters() })),
    clearCats: () => set((s) => ({ filters: IconQuery.from(s.filters).clearCategories().toFilters() })),
    setVariant: (v) => set((s) => ({ filters: IconQuery.from(s.filters).toggleVariant(v).toFilters() })),
    setSort: (k) => set((s) => ({ filters: IconQuery.from(s.filters).sortBy(k).toFilters() })),
    toggleOrder: () => set((s) => ({ filters: IconQuery.from(s.filters).toggleOrder().toFilters() })),
    setPage: (n) => set((s) => ({ filters: IconQuery.from(s.filters).page(n).toFilters() })),
    nextPage: (max) => set((s) => ({ filters: IconQuery.from(s.filters).nextPage(max).toFilters() })),
    prevPage: () => set((s) => ({ filters: IconQuery.from(s.filters).prevPage().toFilters() })),
    setPerPage: (n) => set((s) => ({ filters: IconQuery.from(s.filters).perPage(n).toFilters() })),
    setKind: (k) => set((s) => ({ filters: IconQuery.from(s.filters).kind(k).toFilters() })),
    toggleTag: (tag) => set((s) => ({ filters: IconQuery.from(s.filters).toggleTag(tag).toFilters() })),
    toggleKeyword: (kw) => set((s) => ({ filters: IconQuery.from(s.filters).toggleKeyword(kw).toFilters() })),
    clearTerms: () => set((s) => ({ filters: IconQuery.from(s.filters).clearTerms().toFilters() })),
    setView: (v) => set({ view: v }),
    setCatQ: (v) => set({ catQ: v }),
    toggleGroup: (pack) =>
      set((s) => ({ collapsedGroups: s.collapsedGroups.includes(pack) ? s.collapsedGroups.filter((p) => p !== pack) : [...s.collapsedGroups, pack] })),
    toggleCatExpand: (key) =>
      set((s) => ({ expandedCats: s.expandedCats.includes(key) ? s.expandedCats.filter((k) => k !== key) : [...s.expandedCats, key] })),
    toggleExpandAll: (allGroups, allCatKeys) =>
      set((s) => {
        const fullyExpanded = s.collapsedGroups.length === 0 && allCatKeys.every((k) => s.expandedCats.includes(k));
        return fullyExpanded
          ? { collapsedGroups: [...allGroups], expandedCats: [] }
          : { collapsedGroups: [], expandedCats: [...allCatKeys] };
      }),
    resetFilters: () => set((s) => ({ filters: IconQuery.from(s.filters).reset(DEFAULT_FILTERS).toFilters(), catQ: '', color: null, treatment: 'default', selection: [] })),
  };
}
