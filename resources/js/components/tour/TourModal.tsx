import { Modal } from '@/components/ui/Modal';
import { glyphIcon } from '@/components/ui/glyphIcon';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { ModalFooter, ModalHeader } from '@/components/application/modal-layouts/modal-layouts';
import { cx } from '@/lib/utils/cx';
import { useT } from '@/hooks/useT';
import { TOUR_STEPS } from '@/components/tour/steps';
import { useAppStore } from '@/hooks/useStoreApi';

/**
 * TourModal — the 5-step first-run onboarding (plan Part B). Shown on first load
 * (until `tourSeen`) and replayable from Settings / the help menu.
 *
 * Laid out as Untitled UI PRO's centered-photo-carousel modal (inventory #25): a visual,
 * the centered title and body, step dots, and two equal buttons -- Skip on the first
 * step and Back after it, then Next or Get started. The steps stay store-driven rather
 * than swiped: the carousel would bring embla for five static cards, and each step's
 * copy is announced as the dialog's heading changes. The dots are decorative; the
 * position is announced as text.
 */
export function TourModal() {
  const step = useAppStore((s) => s.tour.step);
  const next = useAppStore((s) => s.nextTourStep);
  const prev = useAppStore((s) => s.prevTourStep);
  const skip = useAppStore((s) => s.skipTour);
  const end = useAppStore((s) => s.endTour);
  const t = useT();

  const total = TOUR_STEPS.length;
  const index = Math.min(step, total - 1);
  const s = TOUR_STEPS[index]!;
  const last = index >= total - 1;

  return (
    <Modal onClose={skip} width={400} label={t('settings.tourTitle')}>
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex h-32 items-center justify-center rounded-lg bg-tertiary">
          <FeaturedIcon color="brand" size="xl" theme="modern" icon={glyphIcon(s.icon)} />
        </div>
      </div>
      <ModalHeader align="center" title={t(s.titleKey)} description={t(s.bodyKey)} />

      <div className="flex flex-col items-center gap-2 pt-5">
        <div aria-hidden className="flex gap-4">
          {TOUR_STEPS.map((_, i) => (
            <span key={i} className={cx('size-2.5 rounded-full transition-colors', i === index ? 'bg-fg-brand-primary_alt' : 'bg-quaternary')} />
          ))}
        </div>
        <span className="sr-only" aria-live="polite">{t('tour.stepOf', { n: index + 1, total })}</span>
      </div>

      <ModalFooter layout="grid">
        {index === 0 ? (
          <Button color="secondary" size="md" onClick={skip}>{t('tour.skip')}</Button>
        ) : (
          <Button color="secondary" size="md" onClick={prev}>{t('tour.back')}</Button>
        )}
        <Button color="primary" size="md" onClick={() => (last ? end() : next())}>
          {last ? t('tour.getStarted') : t('tour.next')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
