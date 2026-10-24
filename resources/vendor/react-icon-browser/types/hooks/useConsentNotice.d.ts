/**
 * Whether this mount shows the consent notice (A6-gaps G17).
 *
 * The answer is site-wide, so the mount follows it: an answer given in another mount on
 * the page lands in this mount's store. While unanswered, the mount claims the page's
 * single notice; only the first claimant renders it, and unmounting hands it on.
 */
export declare function useConsentNotice(unanswered: boolean): boolean;
