import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import type { BrowserStoreHook } from '@/lib/browser';
import type { FlashMessages } from '@/types';

/**
 * Bridge server flash messages into the browser's toast queue (rendered by the
 * shell's `Toaster`). Renders nothing. Each distinct message fires once,
 * keyed on its content, so re-renders and preserveState visits do not
 * duplicate it.
 *
 * It writes to the mount's store, which the page passes in: since the port onto
 * @ichava/react-icon-browser each mount has its own store rather than a module
 * singleton.
 */
export function FlashToasts({ store }: { store: BrowserStoreHook }) {
  const { flash } = usePage<{ flash: FlashMessages }>().props;
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const [kind, message] of Object.entries(flash ?? {})) {
      if (typeof message !== 'string' || !message) continue;
      const key = `${kind}:${message}`;
      if (seen.current.has(key)) continue;
      seen.current.add(key);
      store.getState().showToast(message, kind === 'error' ? 'alert-circle' : 'check');
    }
  }, [flash, store]);

  return null;
}
