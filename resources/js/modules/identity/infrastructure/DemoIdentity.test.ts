import { describe, expect, it } from 'vitest';
import { DemoIdentity } from './DemoIdentity';

/** The demo sign-in, moved out of the store unchanged (architecture 2.9). */
describe('DemoIdentity', () => {
  const demo = new DemoIdentity();

  it('refuses the code 000000 and accepts any other', () => {
    expect(demo.signIn('ada@example.com', '000000', null)).toBeNull();
    expect(demo.signIn('ada@example.com', '123456', null)).not.toBeNull();
  });

  it('signs in as the configured user when there is one', () => {
    expect(demo.signIn('x@example.com', '1', { user: { name: 'Ada Lovelace', initials: 'AL', plan: 'TEAM' } })).toEqual({
      name: 'Ada Lovelace', initials: 'AL', email: 'x@example.com', plan: 'TEAM',
    });
  });

  it('derives name, initials and plan from the email otherwise', () => {
    expect(demo.signIn('grace@example.com', '1', null)).toEqual({ name: 'grace', initials: 'GR', email: 'grace@example.com', plan: 'PRO' });
  });

  it('starts a new account on FREE with initials from both names', () => {
    expect(demo.createAccount({ first: 'Alan', last: 'Turing', email: 'a@t.uk' })).toEqual({ name: 'Alan Turing', initials: 'AT', email: 'a@t.uk', plan: 'FREE' });
    expect(demo.createAccount({ first: '', last: '', email: 'e@x' }).initials).toBe('??');
  });
});
