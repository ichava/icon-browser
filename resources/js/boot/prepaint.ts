/** The id of the static loader a host inlines from `prepaint.html`. */
export const PREPAINT_ID = 'ichava-prepaint';

/**
 * Take down the static prepaint loader, if the page has one.
 *
 * `immediate` removes it at once: the React bootsplash calls it that way because it paints
 * over the same spot, so a fade would show both. Otherwise it fades for 200ms first, which is
 * how the browser and the landing page hand over when there is no bootsplash in between.
 * Safe to call any number of times, and a no-op without a DOM or without a prepaint.
 */
export function dismissPrepaint({ immediate = false }: { immediate?: boolean } = {}): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(PREPAINT_ID);
  if (!el || el.hasAttribute('data-leaving')) return;
  el.setAttribute('data-leaving', '');
  el.removeAttribute('data-slow');
  if (immediate) {
    el.remove();
    return;
  }
  setTimeout(() => el.remove(), 220);
}
