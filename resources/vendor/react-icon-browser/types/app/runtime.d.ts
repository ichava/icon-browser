import { type Logger } from '../modules/telemetry';
export interface BrowserRuntime {
    /** This mount's id: `ichava-1`, `ichava-2`, ... */
    readonly id: string;
    /** This mount's logger: a child of the page's, with its own level and entries (2.9). */
    readonly logger: Logger;
}
/** One mount's runtime. `IchavaBrowser` makes one per mount, once. */
export declare function createBrowserRuntime(): BrowserRuntime;
