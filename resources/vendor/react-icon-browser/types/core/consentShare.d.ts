/**
 * @deprecated Moved to `@ichava/js-ui-kernel` (consent) in 0.1.x; this path may be removed in
 * 0.2.0. It re-exports the kernel's implementation, which is the same code under the same key,
 * so every caller keeps working. Import from `@ichava/js-ui-kernel` in new code.
 */
export { SITE_CONSENT_KEY, isConsent, loadSiteConsent, saveSiteConsent, subscribeSiteConsent, resolveConsent, claimConsentNotice, holdsConsentNotice, subscribeConsentNotice, } from '@ichava/js-ui-kernel';
export type { Consent } from '@ichava/js-ui-kernel';
