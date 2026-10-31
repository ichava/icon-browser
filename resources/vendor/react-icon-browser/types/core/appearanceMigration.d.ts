/**
 * Moves a returning user off the pre-0.1.0 appearance defaults.
 *
 * Until persist version 5 the shipped defaults were the violet accent `#7c3aed` and an 8px
 * radius. The restyle ships lagoon teal `#0e7c66` and 6px. A persisted blob always wins over
 * a new default, so without this every returning user would keep the old look forever, even
 * one who never opened the appearance panel.
 *
 * The store cannot tell "kept the default" from "chose the same value", so a field still
 * holding the old default is treated as never changed and moves. A field holding anything
 * else was a choice and is kept. Each field is judged on its own: a user who changed only
 * the radius keeps their radius and still moves to the new accent.
 */
/** The defaults shipped up to persist version 4. */
export declare const LEGACY_APPEARANCE_DEFAULTS: {
    readonly accent: '#7c3aed';
    readonly radius: 8;
};
/** The defaults shipped from persist version 5. Kept equal to `CONFIG_DEFAULTS` by test. */
export declare const APPEARANCE_DEFAULTS: {
    readonly accent: '#0e7c66';
    readonly radius: 6;
};
/** The persist version that introduced the new defaults. */
export declare const APPEARANCE_DEFAULTS_VERSION = 5;
/**
 * Rewrites `accent` and `radius` in place when they still hold the legacy default and the
 * blob predates {@link APPEARANCE_DEFAULTS_VERSION}. Returns the same object.
 */
export declare function migrateLegacyAppearanceDefaults<T extends Record<string, unknown>>(persisted: T, version: number): T;
