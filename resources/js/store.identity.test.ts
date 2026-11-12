import { describe, expect, it, vi } from 'vitest';
import { createBrowserStore } from './store';
import type { IdentityProvider } from './modules/identity';

/** The store signs in through its identity provider (architecture 2.9). */
describe('the identity port', () => {
  it('uses the demo provider by default, as before', () => {
    const s = createBrowserStore({ persistKey: null });
    expect(s.getState().signIn('ada@example.com', '000000')).toBe(false);
    expect(s.getState().auth.status).toBe('guest');
    expect(s.getState().signIn('ada@example.com', '123456')).toBe(true);
    expect(s.getState().auth).toMatchObject({ status: 'authed', user: { email: 'ada@example.com', plan: 'PRO' } });
  });

  it('asks a host provider instead, for sign-in, accounts and sign-out', () => {
    const provider: IdentityProvider = {
      signIn: vi.fn((email: string) => (email.endsWith('@corp.test') ? { name: 'Staff', initials: 'ST', email, plan: 'TEAM' as const } : null)),
      createAccount: vi.fn((p) => ({ name: p.first, initials: 'NA', email: p.email, plan: 'TEAM' as const })),
      signOut: vi.fn(),
    };
    const s = createBrowserStore({ persistKey: null, identity: provider });
    expect(s.getState().signIn('x@elsewhere.test', '123456')).toBe(false);
    expect(s.getState().signIn('ada@corp.test', '000000')).toBe(true);
    expect(s.getState().auth.user).toMatchObject({ name: 'Staff', plan: 'TEAM' });
    s.getState().signOut();
    expect(provider.signOut).toHaveBeenCalledTimes(1);
    expect(s.getState().auth.status).toBe('guest');
    s.getState().createAccount({ first: 'New', last: 'Person', email: 'n@corp.test' });
    expect(s.getState().auth.user).toMatchObject({ name: 'New', plan: 'TEAM' });
  });
});
