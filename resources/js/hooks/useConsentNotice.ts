import { useEffect, useState, useSyncExternalStore } from 'react';

import { claimConsentNotice, holdsConsentNotice, subscribeConsentNotice, subscribeSiteConsent } from '@ichava/js-ui-kernel';
import { useStoreApi } from '@/hooks/useStoreApi';

/**
 * Whether this mount shows the consent notice (A6-gaps G17).
 *
 * The answer is site-wide, so the mount follows it: an answer given in another mount on
 * the page lands in this mount's store. While unanswered, the mount claims the page's
 * single notice; only the first claimant renders it, and unmounting hands it on.
 */
export function useConsentNotice(unanswered: boolean): boolean {
  const api = useStoreApi();
  const [id] = useState(() => Symbol('ichava.consent.notice'));

  useEffect(
    () =>
      subscribeSiteConsent((c) => {
        if (api.getState().consent !== c) api.setState({ consent: c });
      }),
    [api],
  );

  useEffect(() => (unanswered ? claimConsentNotice(id) : undefined), [unanswered, id]);

  const holds = useSyncExternalStore(subscribeConsentNotice, () => holdsConsentNotice(id), () => holdsConsentNotice(id));
  return unanswered && holds;
}
