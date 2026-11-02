import type { IdentityContext, IdentityProvider, IdentityUser } from '../application/IdentityProvider';
/**
 * The frontend-only demo sign-in (plan Part B), moved out of the store's identity slice
 * unchanged: any code but `000000` signs in, as the configured user when there is one,
 * and a new account starts on FREE. Nothing leaves the browser.
 */
export declare class DemoIdentity implements IdentityProvider {
    signIn(email: string, code: string, context: IdentityContext | null): IdentityUser | null;
    createAccount(p: {
        first: string;
        last: string;
        email: string;
    }): IdentityUser;
    signOut(): void;
}
