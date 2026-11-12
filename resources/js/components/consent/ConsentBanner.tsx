import { useId, useRef } from 'react';

import { CheckVerified02, GripHorizontal } from '@/components/ui/chromeIcons';

import { Button } from '@/components/base/buttons/button';
import { NoticeBanner } from '@/components/shared-assets/banners/notice-banner';
import { CONFIG_DEFAULTS } from '@/core/config';
import { useDraggableNotice } from '@/hooks/useDraggableNotice';
import { useT } from '@/hooks/useT';
import { useAppStore } from '@/hooks/useStoreApi';
import { cx } from '@/lib/utils/cx';

/**
 * ConsentBanner — the "Cookies & storage" notice (plan Part B). Shown until a
 * choice is recorded (persisted). Cosmetic: there is no real tracking to gate —
 * it just records the dismissal so it doesn't reappear.
 *
 * Styled as Untitled UI PRO's dual-action banner (inventory #24), kept as a floating card
 * rather than a full-width bar so it does not cover the grid. No dismiss button: the
 * notice records a choice, and closing it without one would only bring it back.
 *
 * Movable, because a notice that cannot be dismissed must at least get out of the way of
 * whatever it covers: drag the grip at its top (mouse, pen or touch), or focus the grip and
 * use the arrow keys (Shift for bigger steps, Home to put it back). It stays inside the
 * window, and remembers where it was put for the session. The grip is the first thing in
 * the card, so the tab order is grip, "Essential only", "Accept all".
 */
export function ConsentBanner() {
  const setConsent = useAppStore((s) => s.setConsent);
  const consentKey = useAppStore((s) => s.config?.storageKeys.consent) ?? CONFIG_DEFAULTS.storageKeys.consent ?? 'ichava.consent';
  const t = useT();
  const card = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const { dragging, handleProps, style } = useDraggableNotice(card, `${consentKey}.position`);

  return (
    <NoticeBanner
      ref={card}
      role="dialog"
      aria-label={t('consent.ariaLabel')}
      icon={CheckVerified02}
      title={t('consent.title')}
      body={t('consent.body')}
      style={style}
      className={cx(
        'fixed start-4 bottom-4 z-70 w-[360px] max-w-[calc(100vw_-_32px)] [animation:ichRise_.2s_ease]',
        // Keyboard steps glide; a drag follows the pointer exactly. The app's reduced-motion
        // rules (the OS setting and its own toggle) drop the transition entirely.
        !dragging && 'transition-[translate] duration-100 ease-out motion-reduce:transition-none',
        dragging && 'select-none',
      )}
      handle={
        <>
          <button
            type="button"
            aria-label={t('consent.move')}
            aria-describedby={hintId}
            data-consent-handle=""
            {...handleProps}
            className={cx(
              '-mx-2 -mt-2 -mb-3 flex h-4 items-center justify-center rounded-md text-fg-quaternary touch-none',
              'hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)]',
              dragging ? 'cursor-grabbing' : 'cursor-grab',
            )}
          >
            <GripHorizontal className="size-4" />
          </button>
          <span id={hintId} className="sr-only">
            {t('consent.moveHint')}
          </span>
        </>
      }
      actions={
        <>
          <Button color="secondary" size="sm" onClick={() => setConsent('essential')}>
            {t('consent.essentialOnly')}
          </Button>
          <Button size="sm" onClick={() => setConsent('all')}>
            {t('consent.acceptAll')}
          </Button>
        </>
      }
    />
  );
}
