import type { CopyFormat, Scale as ScaleT } from './types';
export type { ScaleT };
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
export type AppEnv = 'production' | 'development';
export interface Workspace {
    id: string;
    name: string;
    plan: string;
    active: boolean;
}
export interface TeamMember {
    initials: string;
    name: string;
    online: boolean;
    /** online | away | offline — falls back to online?online:offline */
    status?: 'online' | 'away' | 'offline';
}
export interface FeatureFlags {
    devtools: boolean;
    collections: boolean;
    history: boolean;
    motion: boolean;
    treatments: boolean;
    multiSelect: boolean;
    presence: boolean;
    /**
     * Development fixtures: the sample signed-in user, seeded collections with
     * fabricated collaborators, and the seeded notification feed.
     *
     * Defaults to FALSE. The standalone dev app turns it on in
     * `public/data/app-config.json`; a host embedding the browser simply omits it
     * and gets a neutral product with no invented data. Keeping the switch in one
     * place is the point -- the alternative is auditing every call site at port
     * time.
     *
     * This flag does NOT gate a real feature. Nothing behind it may ever become a
     * substitute for the host's own auth or data.
     */
    demo: boolean;
}
export interface AppConfig {
    meta: {
        version: string;
        author: string;
        sets: number;
        license: string;
        url: string;
    };
    seo: {
        title: string;
        description: string;
        ogImage?: string;
        canonical?: string;
    };
    env: AppEnv | null;
    debug: {
        enabled: boolean | null;
        logLevel: LogLevel;
    };
    features: FeatureFlags;
    brand: {
        name: string;
        suffix: string;
        tagline: string;
    };
    user: {
        mode: string;
        name: string;
        email: string;
        initials: string;
        plan: string;
        workspaces: Workspace[];
    };
    team: TeamMember[];
    ui: {
        defaultTheme: 'light' | 'dark';
        scale: ScaleT;
        density: 'compact' | 'comfy';
        accentOptions: string[];
        perPageOptions: number[];
        scaleOptions: {
            id: ScaleT;
            label: string;
        }[];
        baseFontSize: number;
        avatarPalette: string[];
    };
    defaults: {
        packages: string[];
        perPage: number;
        sortBy: 'name' | 'package' | 'category';
        sortOrder: 'asc' | 'desc';
        appearance: {
            theme: 'light' | 'dark' | 'system';
            accent: string;
            radius: number;
            scale: ScaleT;
            density: 'compact' | 'comfy';
            reduceMotion: boolean;
            showLabels: boolean; /** Recolour monochrome black icons to the text colour in dark mode (B7). */
            adaptMonochrome?: boolean;
        };
        render: {
            size: number;
            sizeUnit: 'px' | 'rem' | 'em';
            gridStroke: number;
            color: string | null;
            treatment: string;
            copyFormat: CopyFormat;
        };
        collections: {
            id: string;
            name: string;
            icons: number[];
            shared?: boolean;
            role?: 'editor' | 'viewer';
            sharedWith?: {
                initials: string;
                name: string;
            }[];
        }[];
    };
    ranges: {
        size: {
            min: number;
            max: number;
            step: number;
        };
        stroke: {
            min: number;
            max: number;
            step: number;
        };
        radius: {
            min: number;
            max: number;
        };
    };
    limits: {
        historyCap: number;
        recentCommandsCap: number;
        paletteIconResults: number;
        logBuffer: number;
    };
    toolbar: {
        sortOptions: {
            id: string;
            label: string;
        }[];
        treatments: {
            id: string;
            label: string;
            desc: string;
        }[];
        sizeUnits: string[];
        copyFormats: {
            id: CopyFormat;
            label: string;
        }[];
        exportFormats: {
            id: string;
            label: string;
            desc: string;
            icon?: string;
        }[];
    };
    about: {
        description: string;
        creditsTitle: string;
        copyright: string;
        creditsMarqueeSec: number;
        credits: {
            name: string;
            author: string;
            license: string;
        }[];
        links: {
            label: string;
            href: string;
        }[];
        stats: {
            key: string;
            label: string;
        }[];
    };
    /** i18n metadata. The Laravel backend may serve `available` locales + an `endpoint`
     *  returning `{ [locale]: { key: value } }` overrides, kept in the mount's store (`addTranslations`). */
    i18n: {
        locale: string;
        available: string[];
        endpoint?: string;
    };
    /** `consent` is the site-wide consent answer (A6-gaps G17); optional so a host's own
     *  AppConfig written before it existed still type-checks. */
    storageKeys: {
        persist: string;
        driver: string;
        paletteRecent: string;
        locale: string;
        consent?: string;
    };
    /** @ichava/bootsplash config block (Part D). Framework-agnostic; passed to .config(). */
    boot: Record<string, unknown>;
    storage: {
        frontendDriver: 'local' | 'session';
        laravelDriver?: string;
    };
}
export type PartialConfig = DeepPartial<AppConfig>;
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? (T[K] extends unknown[] ? T[K] : DeepPartial<T[K]>) : T[K];
};
/** The single source of truth for every default DATA value. */
export declare const CONFIG_DEFAULTS: AppConfig;
/** Deep-merge a partial config onto another (arrays replace, objects merge). */
export declare function mergeConfig<T>(base: T, over: unknown): T;
/** Resolve a wire-partial config onto the defaults → a complete typed AppConfig. */
export declare function resolveConfig(partial: PartialConfig | null | undefined): AppConfig;
