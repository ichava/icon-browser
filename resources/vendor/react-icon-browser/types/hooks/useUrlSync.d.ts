export interface UrlSyncOptions {
    /**
     * Off by default. The browser must not own the URL when embedded in a host page.
     *
     * Only the standalone app enables this. Previously it was unconditional, which
     * made the in-Laravel kill switch defeat itself: mounting at
     * `/ichava/icons?ui=react` rewrote the query on first render and erased the very
     * flag that selected React.
     */
    enabled?: boolean;
    /**
     * Prefix for the params this hook owns, so they cannot collide with a host's.
     * Empty keeps the short unprefixed names the standalone app has always used and
     * whose links are already shared.
     */
    prefix?: string;
}
/**
 * A permalink to `iconId`: the current URL with only this mount's icon param set.
 *
 * The detail dialog used to build `origin + pathname + ?icon=<id>`, which dropped the
 * host's own query and hash (including the `ui=react` flag that selects this frontend
 * inside Laravel) and ignored the mount's prefix (A6-gaps G7).
 */
export declare function permalinkFor(href: string, iconId: number, prefix?: string): string;
/** Whether this mount reads the URL, and under which prefix. Provided by `IchavaBrowser`. */
export declare const UrlSyncContext: import("react").Context<{
    enabled: boolean;
    prefix: string;
}>;
/** A permalink builder for the current mount, or null when it does not read the URL. */
export declare function usePermalink(): ((iconId: number) => string) | null;
/**
 * Permalinks and shareable state. On mount, hydrate filters plus an open icon from
 * the URL (`?icon=<id>` deep-links a detail view); thereafter mirror filter and
 * detail state back into the query string.
 *
 * Two invariants, both of which were violated:
 *
 * 1. It must be opt-in. See `enabled`.
 * 2. It must preserve what it does not own. The previous implementation built a
 *    fresh URLSearchParams and replaced the whole query, discarding every param the
 *    host had set and dropping the hash. It now edits only its own keys in place.
 */
export declare function useUrlSync({ enabled, prefix }?: UrlSyncOptions): void;
