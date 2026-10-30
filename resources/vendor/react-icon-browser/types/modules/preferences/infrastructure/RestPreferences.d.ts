import type { HttpTransport } from '../../catalog';
/**
 * The browser preferences a host keeps for its user, in the browser's terms. Each is
 * optional: a host stores what it validates, and the browser applies what came back.
 */
export interface HostPreferences {
    view?: 'grid' | 'list';
    size?: number;
    perPage?: number;
    sortBy?: 'name' | 'package' | 'category';
    sortOrder?: 'asc' | 'desc';
}
interface WirePreferences {
    preferences?: {
        view_mode?: string;
        icon_size?: number;
        per_page?: number;
    };
    sorting?: {
        sort_by?: string;
        sort_direction?: string;
    };
}
/** The wire payload for a preferences update: only values the host accepts. */
export declare function toWire(p: HostPreferences): WirePreferences;
/** The browser's preferences from what the host keeps; unknown or invalid values are dropped. */
export declare function fromWire(w: WirePreferences): HostPreferences;
/** Where a REST host keeps preferences, by the bootstrap map's `preferences.*` keys. */
export interface PreferenceEndpoints {
    /** `preferences.show`: GET. */
    show: string | null;
    /** `preferences.update`: POST. */
    update: string | null;
    /** `preferences.reset`: DELETE. */
    reset: string | null;
}
/**
 * Preferences kept by a REST host: GET to read, POST to update, DELETE to reset. Built
 * from one URL serving all three (`new RestPreferences(url, transport)`), or from the
 * host's REST map, one route each (`RestPreferences.withEndpoints(...)`), where a route
 * the host did not mount is skipped.
 */
export declare class RestPreferences {
    #private;
    constructor(url: string, transport: HttpTransport);
    /** Preferences at the routes the host's REST map names (`preferences.show`, `.update`, `.reset`). */
    static withEndpoints(endpoints: PreferenceEndpoints, transport: HttpTransport): RestPreferences;
    load(): Promise<HostPreferences>;
    save(p: HostPreferences): Promise<void>;
    reset(): Promise<void>;
}
export {};
