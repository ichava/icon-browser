import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type UiSlice = Pick<BrowserStore, 'layer' | 'detailId' | 'libTab' | 'librarySeed' | 'openLayer' | 'closeLayer' | 'openDetail' | 'openLibrary' | 'showToast' | 'dismissToast' | 'toasts' | 'ctx' | 'openCtx' | 'closeCtx' | 'confirm' | 'openConfirm' | 'closeConfirm' | 'tasks' | 'runTask'>;
/** How long work may run before the task loader shows (Sim: tasks over 2 seconds). */
export declare const TASK_LOADER_DELAY_MS = 2000;
export declare function uiSlice(set: SetState, get: GetState): UiSlice;
export {};
