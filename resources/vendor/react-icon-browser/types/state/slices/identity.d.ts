import type { StoreApi } from 'zustand';
import type { DevBus } from '../../modules/telemetry';
import type { IdentityProvider } from '../../modules/identity';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type IdentitySlice = Pick<BrowserStore, 'auth' | 'authView' | 'authReason' | 'authInitialized' | 'openAuth' | 'closeAuth' | 'signIn' | 'createAccount' | 'signOut'>;
export declare function identitySlice(set: SetState, get: GetState, bus: DevBus, identity: IdentityProvider): IdentitySlice;
export {};
