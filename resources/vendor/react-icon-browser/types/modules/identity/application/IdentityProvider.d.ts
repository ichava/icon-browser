/** A signed-in user, as the browser shows one. Same shape as the store's `AuthUser`. */
export interface IdentityUser {
    name: string;
    initials: string;
    email: string;
    plan: 'FREE' | 'PRO' | 'TEAM';
}
/** What a provider may read from the app config: the configured user, if any. */
export interface IdentityContext {
    user?: {
        name?: string;
        initials?: string;
        plan?: string;
    } | null;
}
/**
 * The port the store's sign-in, account creation and sign-out go through (architecture
 * 3.2, identity). The browser ships `DemoIdentity`, the frontend-only demo it has always
 * had; a host with real accounts supplies its own through `createBrowserStore({ identity })`.
 *
 * Synchronous, because the store's `signIn` returns its answer synchronously and that
 * signature is public. A provider that must call a server answers from what it already
 * knows (a session the host established) rather than awaiting one here.
 */
export interface IdentityProvider {
    /** The user for these credentials, or null when they are refused. */
    signIn(email: string, code: string, context: IdentityContext | null): IdentityUser | null;
    /** The user a new account starts as. */
    createAccount(person: {
        first: string;
        last: string;
        email: string;
    }): IdentityUser;
    /** Called after the store has signed the user out. */
    signOut(): void;
}
