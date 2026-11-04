/** localStorage key holding the id. Namespaced, like the store's own `ichava.browser.v2`. */
export declare const BROWSER_ID_KEY = "ichava.browser-id";
/** The stable per-install browser id sent as `X-Browser-Id`. */
export declare function getBrowserId(): string;
/** Test seam: drop the in-memory copy so the next call reads storage again. */
export declare function __resetBrowserId(): void;
