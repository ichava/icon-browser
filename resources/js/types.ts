import type { SnippetConfig } from '@/lib/browser';
/**
 * The host's signed-in user as the server presents it (core's `UserData`). The same shape
 * arrives in the `auth` prop and in `GET {prefix}/api/session`. No email: extra attributes
 * appear only when the host lists them in `ichava.ichava-core.auth.expose`.
 */
export interface AuthUser {
    id: string;
    name: string;
    avatarUrl: string | null;
    abilities: Record<string, boolean>;
    [extra: string]: unknown;
}

export interface FlashMessages {
    success?: string;
    error?: string;
}

/**
 * What the browser shell says about this package (`ichava.icon-browser.ui` in config). The
 * library's own defaults describe react-icon-browser, so without these the settings footer
 * and the About dialog would show its version and an MIT licence this package does not have.
 */
export interface IchavaUi {
    version: string | null;
    license: string;
    docsUrl: string | null;
    links: { label: string; href: string }[];
}

export interface IchavaShared {
    prefix: string;
    /** Optional: a host that replaces `HandleInertiaRequests` may not send it. */
    ui?: IchavaUi;
    /** `ichava.icon-browser.snippets`, camelCased, only the keys the host set. Optional for the same reason. */
    snippets?: Partial<SnippetConfig>;
    perPage: number;
    defaultTheme: string;
    routes: {
        browser: string;
        stats: string;
        packages: string;
        favorites: string;
        collections: string;
        history: string;
        commands: string;
        settings: string;
        cache: {
            clear: string;
            rebuild: string;
        };
    };
}

export interface SharedProps {
    auth: AuthUser | null;
    flash: FlashMessages;
    preferences: Record<string, unknown>;
    ichava: IchavaShared;
    errors: Record<string, string>;
    [key: string]: unknown;
}
