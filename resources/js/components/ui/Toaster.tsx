import { useEffect } from 'react';

import { glyphIcon } from '@/components/ui/glyphIcon';
import { NotificationCard, type NotificationColor } from '@/components/application/notifications/notification-card';
import { useT } from '@/hooks/useT';
import { useAppStore } from '@/hooks/useStoreApi';

/** How long a toast stays up before dismissing itself. */
const DWELL_MS = 3200;

/**
 * Toaster — renders the store's toast queue.
 *
 * Replaces `sonner`. The reason is not the library: it is that `store.ts` imported
 * `toast` from it and called into a UI at the point of a state change, which is finding
 * A7 -- the state layer knowing about presentation. The store now owns a queue and this
 * component owns how a toast looks, which also means a host embedding the browser can
 * render the queue its own way, and tests can assert on it without a DOM.
 *
 * `aria-live="polite"` on the region rather than a role per toast: a screen reader
 * announces new children as they arrive without stealing focus, which is what a transient
 * confirmation wants. `role="alert"` would interrupt.
 *
 * Each toast is Untitled UI PRO's notification card (inventory #27): a featured icon
 * coloured by the toast's glyph, the message, and a named close button. Toasts used to
 * be whole-card buttons, so the message itself was announced as a button.
 */
export function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);
  const t = useT();

  // One timer per toast, keyed by id, cleared on unmount so a fast unmount cannot fire a
  // dismiss into a torn-down store.
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), DWELL_MS));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed end-4 bottom-4 z-[var(--z-toast)] flex flex-col gap-2 pointer-events-none text-[length:var(--app-font,13.5px)]"
    >
      {toasts.map((toast) => (
        <NotificationCard
          key={toast.id}
          icon={glyphIcon(toast.icon)}
          color={toneOf(toast.icon)}
          onClose={() => dismiss(toast.id)}
          closeLabel={t('common.close')}
          className="pointer-events-auto [animation:ichIn_.14s_ease]"
        >
          {toast.msg}
        </NotificationCard>
      ))}
    </div>
  );
}

/** The featured icon's colour, read from the glyph the caller chose. */
function toneOf(icon: string): NotificationColor {
  if (icon === 'alert-circle') return 'error';
  if (icon === 'check') return 'success';
  return 'brand';
}
