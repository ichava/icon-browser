export interface AuthUser {
    id: number;
    name: string;
    email: string;
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
