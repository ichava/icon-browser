export type Consent = 'essential' | 'all';
/** The site-wide localStorage key. */
export declare const SITE_CONSENT_KEY: string;
export declare function isConsent(v: unknown): v is Consent;
/** The site-wide answer, or null when nobody has answered (or storage is unavailable). */
export declare function loadSiteConsent(): Consent | null;
/** Record (or, with null, clear) the site-wide answer and tell every same-document mount. */
export declare function saveSiteConsent(c: Consent | null): void;
/** Subscribe to same-document answer changes. Returns an unsubscribe function. */
export declare function subscribeSiteConsent(fn: (c: Consent | null) => void): () => void;
/**
 * The answer a store starts from: the site-wide one when it exists; otherwise a valid
 * per-mount answer from the mount's persisted blob, which is adopted as the site-wide
 * answer so it is read only this once.
 */
export declare function resolveConsent(perMount: unknown): Consent | null;
/** Queue a claim on the page's single consent notice. Returns the release function. */
export declare function claimConsentNotice(id: symbol): () => void;
/** Whether this claim currently holds the notice. */
export declare function holdsConsentNotice(id: symbol): boolean;
/** Subscribe to changes of which claim holds the notice. */
export declare function subscribeConsentNotice(fn: () => void): () => void;
