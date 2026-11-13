import { useAppStore } from '@/hooks/useStoreApi';
import type { AuthUser } from '@/store';

/**
 * The account the chrome shows: the signed-in user, else the configured one (the
 * standalone demo's sample user), else nobody. One place, so the header menu, the
 * profile and settings cannot disagree about who is signed in.
 *
 * A host user carries no email and no plan: the host never sends the email to the
 * browser, and a plan is a demo notion with nothing behind it in a host app.
 */
export function useAccount(): AuthUser | null {
  const authUser = useAppStore((s) => s.auth.user);
  const configured = useAppStore((s) => s.config?.user);
  const host = useAppStore((s) => s.config?.host ?? null);
  if (authUser) return authUser;
  if (host || !configured) return null;
  return { name: configured.name, initials: configured.initials, email: configured.email, plan: (configured.plan || null) as AuthUser['plan'] };
}
