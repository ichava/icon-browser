/**
 * Hand over from the static loader that `<x-ichava::prepaint />` inlines in the layout.
 *
 * react-icon-browser removes it when IchavaBrowser mounts, but only the Browser page mounts
 * IchavaBrowser. Every other Inertia page (Settings, Collections, Stats…) would sit under a
 * full-screen loader, so the app removes it after its own first commit as well.
 *
 * Mirrors react-icon-browser's `dismissPrepaint()` (src/boot/prepaint.ts), which the library
 * does not export; the element id is the contract between them. Safe to call more than once.
 */
export const PREPAINT_ID = 'ichava-prepaint';

export function dismissPrepaint(): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(PREPAINT_ID);
  if (!el || el.hasAttribute('data-leaving')) return;
  el.setAttribute('data-leaving', '');
  el.removeAttribute('data-slow');
  setTimeout(() => el.remove(), 220);
}
