import type { StoreApi } from 'zustand';
import type { DevBus } from '../../modules/telemetry';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type CollaborationSlice = Pick<BrowserStore, 'inviteOpen' | 'accessCollectionId' | 'sharedOpen' | 'openShared' | 'closeShared' | 'openInvite' | 'closeInvite' | 'openAccess' | 'closeAccess' | 'shareCollection'>;
export declare function collaborationSlice(set: SetState, get: GetState, bus: DevBus): CollaborationSlice;
export {};
