import { describe, expect, it, vi } from 'vitest';
import { HostIdentity, initialsOf } from '@/modules/identity';
import { ADA } from '@/test/hostFixtures';

const links = { login: 'https://app.test/login', logout: 'https://app.test/logout' };

describe('HostIdentity', () => {
  it('reports the host user, with no email and no plan', () => {
    const id = new HostIdentity(ADA, links);
    expect(id.current()).toEqual({ id: '42', name: 'Ada Lovelace', initials: 'AL', email: '', plan: null, avatarUrl: null, abilities: ADA.abilities });
    expect(new HostIdentity(null, links).current()).toBeNull();
  });

  it('never takes credentials and never creates an account', () => {
    const id = new HostIdentity(null, links);
    expect(id.signIn()).toBeNull();
    expect(() => id.createAccount()).toThrow(/host/);
  });

  it('sends sign-in to the host login page', () => {
    const navigate = vi.fn();
    expect(new HostIdentity(null, links, { navigate }).beginSignIn()).toBe(true);
    expect(navigate).toHaveBeenCalledWith('https://app.test/login');
    expect(new HostIdentity(null, { login: null, logout: null }, { navigate }).beginSignIn()).toBe(false);
  });

  it('signs out at the host logout route, then follows where it sent the browser', async () => {
    const navigate = vi.fn();
    const logout = vi.fn().mockResolvedValue('https://app.test/');
    new HostIdentity(ADA, links, { navigate, logout }).signOut();
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('https://app.test/'));
    expect(logout).toHaveBeenCalledWith('https://app.test/logout');
  });

  it('makes initials from a display name', () => {
    expect(initialsOf('Ada Lovelace')).toBe('AL');
    expect(initialsOf('ada')).toBe('AD');
    expect(initialsOf('Grace Brewster Hopper')).toBe('GH');
    expect(initialsOf('  ')).toBe('?');
  });
});
