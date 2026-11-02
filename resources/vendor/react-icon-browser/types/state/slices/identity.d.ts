import type { StoreApi } from 'zustand';
import type { DevBus } from '../../modules/telemetry';
import { type IdentityProvider } from '../../modules/identity';
import type { HostContext } from '../../modules/host';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type IdentitySlice = Pick<BrowserStore, 'auth' | 'authView' | 'authReason' | 'authInitialized' | 'openAuth' | 'closeAuth' | 'signIn' | 'createAccount' | 'signOut'>;
/**
 * The identity this store signs in through: the one it was given, else the host's user
 * when the config carries a host context, else the frontend-only demo.
 */
export declare function identityFor(given: IdentityProvider | undefined, host: HostContext | null | undefined, demo: IdentityProvider): IdentityProvider;
export declare function identitySlice(set: SetState, get: GetState, bus: DevBus, given: IdentityProvider | undefined): IdentitySlice;
export {};
