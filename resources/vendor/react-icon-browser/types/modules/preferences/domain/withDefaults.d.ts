/**
 * The precedence rule for preference blocks (architecture 2.7): every key of `defaults`,
 * taken from `patch` unless the patch leaves it out or sets it to null. Keys the defaults
 * do not have are ignored, so a config cannot invent a preference.
 *
 * Plain TypeScript with no defaults of its own: the caller passes them, so the rule is
 * testable without the app's config.
 */
export declare function withDefaults<T extends Record<string, unknown>>(defaults: T, patch: {
    readonly [K in keyof T]?: unknown;
} | null | undefined): T;
