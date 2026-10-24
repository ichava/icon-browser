import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type LibrarySlice = Pick<BrowserStore, 'favorites' | 'history' | 'collections' | 'toggleFavorite' | 'pushHistory' | 'clearHistory' | 'createCollection' | 'renameCollection' | 'removeCollection' | 'addToCollection' | 'removeFromCollection'>;
export declare function librarySlice(set: SetState, _get: GetState): LibrarySlice;
export {};
