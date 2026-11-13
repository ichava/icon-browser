// Sign-in state, through an identity provider (the demo one by default, plan Part B).
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import type { DevBus } from '@/modules/telemetry';
import { DemoIdentity, HostIdentity, type IdentityProvider } from '@/modules/identity';
import type { HostContext } from '@/modules/host';
import type { AuthUser } from '../types';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type IdentitySlice = Pick<
  BrowserStore,
  'auth'
  | 'authView'
  | 'authReason'
  | 'authInitialized'
  | 'openAuth'
  | 'closeAuth'
  | 'signIn'
  | 'createAccount'
  | 'signOut'
>;

/** One `HostIdentity` per host context, so a provider is not rebuilt on every action. */
const hostIdentities = new WeakMap<HostContext, HostIdentity>();

/**
 * The identity this store signs in through: the one it was given, else the host's user
 * when the config carries a host context, else the frontend-only demo.
 */
export function identityFor(given: IdentityProvider | undefined, host: HostContext | null | undefined, demo: IdentityProvider): IdentityProvider {
  if (given) return given;
  if (!host) return demo;
  let id = hostIdentities.get(host);
  if (!id) {
    id = new HostIdentity(host.user, host.links);
    hostIdentities.set(host, id);
  }
  return id;
}

export function identitySlice(set: SetState, get: GetState, bus: DevBus, given: IdentityProvider | undefined): IdentitySlice {
  const demo = new DemoIdentity();
  const provider = () => identityFor(given, get().config?.host, demo);
  return {
    auth: { status: 'guest', user: null },
    authView: null,
    authReason: null,
    authInitialized: false,
    // A provider whose sign-in lives elsewhere (the host's login page) takes the request
    // over; the browser's own form opens only when none does.
    openAuth: (view, reason) => {
      if (view !== 'signout' && provider().beginSignIn?.(view)) return;
      set({ authView: view, authReason: reason ?? null });
    },
    closeAuth: () => set({ authView: null, authReason: null }),
    signIn: (email, code) => {
      // Who signs in is the identity provider's answer (DemoIdentity unless the host gave one).
      const user: AuthUser | null = provider().signIn(email, code, get().config);
      if (!user) return false;
      set({ auth: { status: 'authed', user }, authView: null, authInitialized: true });
      bus.emit('auth', 'auth.signin', { email });
      get().pushNotification({ icon: 'check', text: 'Signed in — collections and sharing unlocked' });
      return true;
    },
    createAccount: (p) => {
      const user: AuthUser = provider().createAccount(p);
      set({ auth: { status: 'authed', user }, authView: null, authInitialized: true });
      bus.emit('auth', 'auth.create', { email: p.email });
      get().pushNotification({ icon: 'check', text: 'Account created — welcome to Ichava' });
    },
    signOut: () => {
      set({ auth: { status: 'guest', user: null }, authView: null, authInitialized: true });
      provider().signOut();
      bus.emit('auth', 'auth.signout');
    },
  };
}
