import { TourModal } from '@/components/tour/TourModal';
import { ConsentBanner } from '@/components/consent/ConsentBanner';
import { useAppStore } from '@/hooks/useStoreApi';

export type OnboardingOverlay = 'consent' | 'tour' | null;

/**
 * Which first-run overlay may be on screen. At most one, consent first.
 *
 * The tour is a modal: its overlay covers the whole viewport and takes every click.
 * Rendered beside the consent banner, it sat on top of the banner's buttons, so the
 * one choice the page asks for first could not be made until the tour was dismissed
 * (B3 / I6). The tour can still be *started* early -- the first-run effect and the
 * replay buttons only flip `tour.active` -- it is just not shown until a consent
 * choice is recorded.
 */
export function activeOnboardingOverlay(
  consent: 'essential' | 'all' | null,
  tourActive: boolean,
): OnboardingOverlay {
  if (consent === null) return 'consent';
  if (tourActive) return 'tour';
  return null;
}

/** Renders the consent banner, then the tour once consent has been given. */
export function OnboardingLayer() {
  const consent = useAppStore((s) => s.consent);
  const tourActive = useAppStore((s) => s.tour.active);
  const overlay = activeOnboardingOverlay(consent, tourActive);

  if (overlay === 'consent') return <ConsentBanner />;
  if (overlay === 'tour') return <TourModal />;
  return null;
}
