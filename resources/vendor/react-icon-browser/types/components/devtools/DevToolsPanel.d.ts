/**
 * DevToolsPanel — the developer drawer (plan Parts B+E). Events (live devbus log,
 * pause/clear), State (picked UI state), Storage (real driver toggle + copy/reset), Tests
 * (real regression), Logs (logger ring buffer), Boot (splash phase timeline). Mounted only
 * when debug tooling is available (env gate).
 *
 * It docks to any edge and resizes from its inner edge, by dragging or with the arrow
 * keys on that handle; both choices persist with the rest of the user's preferences.
 */
export declare function DevToolsPanel(): import("react").JSX.Element;
