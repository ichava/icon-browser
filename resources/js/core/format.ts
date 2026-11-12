// Small pure helpers shared across the UI. No React, no side effects.

export const num = (n: number): string => n.toLocaleString('en-US');

/** Platform-aware modifier key label (⌘ on Apple, Ctrl+ elsewhere). */
export function modKey(): string {
  if (typeof navigator === 'undefined') return 'Ctrl+';
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? '⌘' : 'Ctrl+';
}

/** The reset-filters chord, as shown in hints: ⇧⌘⌫ on Apple platforms, Ctrl+Shift+Backspace elsewhere. */
export function resetKeyHint(mod: string = modKey()): string {
  return mod === '⌘' ? '⇧⌘⌫' : 'Ctrl+Shift+Backspace';
}

/**
 * The DevTools toggle is Shift+Mod+D. Mod+D is the browser's bookmark key, which a page
 * must leave alone (A6-gaps G4, final audit R-18).
 */
export function devtoolsKeyHint(mod: string = modKey()): string {
  return mod === '⌘' ? '⇧⌘D' : 'Ctrl+Shift+D';
}

export function relativeTime(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

/** hue (0–360) + lightness (0–100) → hex, fixed saturation for the picker gradient. */
export function hslToHex(h: number, l: number, s = 62): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
