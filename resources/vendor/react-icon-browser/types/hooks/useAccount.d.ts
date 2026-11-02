import type { AuthUser } from '../store';
/**
 * The account the chrome shows: the signed-in user, else the configured one (the
 * standalone demo's sample user), else nobody. One place, so the header menu, the
 * profile and settings cannot disagree about who is signed in.
 *
 * A host user carries no email and no plan: the host never sends the email to the
 * browser, and a plan is a demo notion with nothing behind it in a host app.
 */
export declare function useAccount(): AuthUser | null;
