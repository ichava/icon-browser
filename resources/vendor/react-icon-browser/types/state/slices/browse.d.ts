import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type BrowseSlice = Pick<BrowserStore, 'filters' | 'view' | 'catQ' | 'collapsedGroups' | 'expandedCats' | 'searchScope' | 'packageQuery' | 'sidebarOpen' | 'setSearchScope' | 'setPackageQuery' | 'toggleSidebar' | 'setSidebarOpen' | 'setSearch' | 'clearSearch' | 'togglePackage' | 'selectAllPacks' | 'clearPacks' | 'toggleCat' | 'toggleSub' | 'clearCats' | 'setVariant' | 'setSort' | 'toggleOrder' | 'setPage' | 'nextPage' | 'prevPage' | 'setPerPage' | 'setView' | 'setCatQ' | 'toggleGroup' | 'toggleCatExpand' | 'toggleExpandAll' | 'resetFilters'>;
export declare function browseSlice(set: SetState, _get: GetState): BrowseSlice;
export {};
