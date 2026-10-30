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
    /** `browser.theme_toggle`: whether the theme control shows. */
    themeToggle?: boolean;
}

/** One entry of the features manifest (`ichava.features`, `GET {prefix}/api/bootstrap`). */
export interface IchavaFeature {
    enabled: boolean;
    /** Why it is off: `config`, `gate`, `driver` or `empty`; null when on. */
    reason: 'config' | 'gate' | 'driver' | 'empty' | null;
    /** Endpoint name to absolute URL; parameters stay as `{name}` placeholders. */
    endpoints: Record<string, string>;
}

export interface IchavaShared {
    prefix: string;
    /** Optional: absent from a host that replaces `HandleInertiaRequests`. */
    schemaVersion?: string;
    locale?: string;
    modes?: { inertia: boolean; api: boolean };
    features?: Record<string, IchavaFeature>;
    account?: { login: string | null; logout: string | null };
    storage?: { tier: string | null; persistent: boolean | null };
    /** Optional: a host that replaces `HandleInertiaRequests` may not send it. */
    ui?: IchavaUi;
    /** `ichava.icon-browser.snippets`, camelCased, only the keys the host set. Optional for the same reason. */
    snippets?: Partial<SnippetConfig>;
    perPage: number;
    defaultTheme: string;
    /**
     * The server sends null for a route a disabled feature left unmounted. Typed as strings
     * until the browser reads `features` first (react-icon-browser's manifest-driven modules).
     */
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
