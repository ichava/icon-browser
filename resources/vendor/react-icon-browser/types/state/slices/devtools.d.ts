import type { StoreApi } from 'zustand';
import type { DevBus } from '../../modules/telemetry';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type DevtoolsSlice = Pick<BrowserStore, 'devtools' | 'toggleDevtools' | 'setDevToolsTab' | 'pushDevEvent' | 'clearDevEvents' | 'setCapturing'>;
export declare function devtoolsSlice(set: SetState, _get: GetState, bus: DevBus): DevtoolsSlice;
export {};
