/** A signed-in user, as the browser shows one. Same shape as the store's `AuthUser`. */
export interface IdentityUser {
    name: string;
    initials: string;
    /** Empty for a host user: the host never sends an email to the browser. */
    email: string;
    /** The demo's tier badge. Null for a host user: there is no plan in a host app. */
    plan: 'FREE' | 'PRO' | 'TEAM' | null;
    /** The host's user id. Present only for a user the host signed in. */
    id?: string;
    /** The host's avatar URL, when it has one. */
    avatarUrl?: string | null;
    /** The host's Gates for this user, ability => granted. The UI checks these, never roles. */
    abilities?: Readonly<Record<string, boolean>>;
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
 * had, and `HostIdentity`, which takes the host application's signed-in user. A host
 * with another arrangement supplies its own through `createBrowserStore({ identity })`.
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
    /**
     * The user already signed in, when the provider knows one without asking (the host's
     * session). Absent or null: the browser starts as a guest.
     */
    current?(): IdentityUser | null;
    /**
     * Take over a request to sign in or create an account, for a provider whose sign-in
     * lives somewhere else (the host's login page). Returns true when it did, so the
     * browser does not open its own form.
     */
    beginSignIn?(view: 'signin' | 'create'): boolean;
}
