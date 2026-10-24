export declare const num: (n: number) => string;
/** Platform-aware modifier key label (⌘ on Apple, Ctrl+ elsewhere). */
export declare function modKey(): string;
/** The reset-filters chord, as shown in hints: ⇧⌘⌫ on Apple platforms, Ctrl+Shift+Backspace elsewhere. */
export declare function resetKeyHint(mod?: string): string;
export declare function relativeTime(ts: number, now?: number): string;
/** hue (0–360) + lightness (0–100) → hex, fixed saturation for the picker gradient. */
export declare function hslToHex(h: number, l: number, s?: number): string;
/**
 * @deprecated Moved to `@ichava/js-ui-kernel` (color) in 0.1.x; this path may be removed in
 * 0.2.0. It re-exports the kernel's implementation, which is the same code, so every
 * caller keeps working. Import from `@ichava/js-ui-kernel` in new code.
 */
export { isValidHex, hexWithAlpha, FALLBACK_ACCENT_RGB, hexToRgba, contrastRatio, mixHex, compositeHex, readableOn, } from '@ichava/js-ui-kernel';
