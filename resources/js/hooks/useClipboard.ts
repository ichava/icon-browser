import { useAppStore } from '@/hooks/useStoreApi';
import { useT } from '@/hooks/useT';

/**
 * Write to the clipboard, keeping the write inside the click that asked for it.
 *
 * A grid tile's copy text is built asynchronously (the SVG body is fetched first), and
 * Safari refuses `writeText` once an `await` has passed: the user activation is gone, so
 * the copy failed there while it worked in Chrome. `ClipboardItem` accepts a promise and
 * resolves it itself, which is the one shape every engine keeps inside the gesture. A
 * string still goes through `writeText`, and an engine without the async API gets the
 * `execCommand` fallback.
 */
export async function writeClipboard(text: string | Promise<string>): Promise<void> {
  const clip = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  if (typeof text !== 'string' && clip?.write && typeof ClipboardItem !== 'undefined') {
    try {
      const blob = Promise.resolve(text).then((t) => new Blob([t], { type: 'text/plain' }));
      await clip.write([new ClipboardItem({ 'text/plain': blob })]);
      return;
    } catch {
      // An engine that rejects a promised ClipboardItem; try the plain path below.
    }
  }
  const value = await text;
  if (clip?.writeText) {
    await clip.writeText(value);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = value;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('execCommand copy failed');
}

/** Copy text with a graceful fallback + a toast, so callers stay one-liners. */
export function useCopy() {
  const showToast = useAppStore((s) => s.showToast);
  const t = useT();
  return async (text: string | Promise<string>, label = t('clipboard.copied')) => {
    try {
      await writeClipboard(text);
      showToast(label, 'copy');
    } catch {
      showToast(t('clipboard.copyFailed'), 'alert-circle');
    }
  };
}
