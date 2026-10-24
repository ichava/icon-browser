import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type UiSlice = Pick<BrowserStore, 'layer' | 'detailId' | 'libTab' | 'openLayer' | 'closeLayer' | 'openDetail' | 'openLibrary' | 'showToast' | 'dismissToast' | 'toasts' | 'ctx' | 'openCtx' | 'closeCtx' | 'confirm' | 'openConfirm' | 'closeConfirm'>;
export declare function uiSlice(set: SetState, get: GetState): UiSlice;
export {};
