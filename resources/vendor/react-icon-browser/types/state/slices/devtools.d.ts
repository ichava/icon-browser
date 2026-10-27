import type { StoreApi } from 'zustand';
import type { DevBus } from '../../modules/telemetry';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type DevtoolsSlice = Pick<BrowserStore, 'devtools' | 'toggleDevtools' | 'setDevToolsTab' | 'pushDevEvent' | 'clearDevEvents' | 'setCapturing' | 'devtoolsLayout' | 'setDevtoolsDock' | 'setDevtoolsSize'>;
/** The drawer's size limits, in px. The upper bound is also capped by the window at render. */
export declare const DEVTOOLS_SIZE: {
    readonly min: 120;
    readonly max: 1600;
    readonly default: 260;
};
export declare function devtoolsSlice(set: SetState, _get: GetState, bus: DevBus): DevtoolsSlice;
export {};
