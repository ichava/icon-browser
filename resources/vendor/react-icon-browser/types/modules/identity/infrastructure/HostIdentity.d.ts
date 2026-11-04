import type { IdentityProvider, IdentityUser } from '../application/IdentityProvider';
/** The host's user as icon-browser presents it (`UserData`): never an email or a token. */
export interface HostUserData {
    id: string;
    name: string;
    avatarUrl: string | null;
    abilities: Readonly<Record<string, boolean>>;
}
/** The host's own sign-in and sign-out routes. */
export interface HostAccountLinks {
    login: string | null;
    logout: string | null;
}
export interface HostIdentityOptions {
    /** Go to a URL. Defaults to `window.location.assign`. */
    navigate?: (url: string) => void;
    /**
     * Sign out at the host. Laravel's logout route takes a POST with the CSRF token, so the
     * default posts with the `XSRF-TOKEN` cookie as `X-XSRF-TOKEN` and resolves to where
     * the host sent the browser afterwards.
     */
    logout?: (url: string) => Promise<string | null>;
}
/** Up to two initials from a display name: "Ada Lovelace" -> "AL", "ada" -> "AD". */
export declare function initialsOf(name: string): string;
/** The browser's user for a host `UserData`. */
export declare function fromHostUser(user: HostUserData): IdentityUser;
/**
 * The identity of a browser running inside a host application.
 *
 * The host signed the user in; this only reports who that is. Sign-in and account
 * creation go to the host's login page, and sign-out to its logout route. Nothing here
 * takes credentials: `signIn` always refuses, because the package never renders a login
 * of its own.
 */
export declare class HostIdentity implements IdentityProvider {
    #private;
    constructor(user: HostUserData | null, links: HostAccountLinks, opts?: HostIdentityOptions);
    current(): IdentityUser | null;
    signIn(): IdentityUser | null;
    createAccount(): IdentityUser;
    beginSignIn(): boolean;
    signOut(): void;
}
