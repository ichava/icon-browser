import type { IdentityContext, IdentityProvider, IdentityUser } from '../application/IdentityProvider';

const initials2 = (a: string, b?: string): string =>
  ((a?.[0] ?? '') + (b?.[0] ?? a?.[1] ?? '')).toUpperCase() || '??';

/**
 * The frontend-only demo sign-in (plan Part B), moved out of the store's identity slice
 * unchanged: any code but `000000` signs in, as the configured user when there is one,
 * and a new account starts on FREE. Nothing leaves the browser.
 */
export class DemoIdentity implements IdentityProvider {
  signIn(email: string, code: string, context: IdentityContext | null): IdentityUser | null {
    if (code === '000000') return null;
    return {
      name: context?.user?.name ?? email.split('@')[0]!,
      initials: context?.user?.initials ?? initials2(email),
      email,
      plan: (context?.user?.plan as IdentityUser['plan']) ?? 'PRO',
    };
  }

  createAccount(p: { first: string; last: string; email: string }): IdentityUser {
    return { name: `${p.first} ${p.last}`.trim(), initials: initials2(p.first, p.last), email: p.email, plan: 'FREE' };
  }

  signOut(): void {}
}
