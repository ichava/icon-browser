export declare const num: (n: number) => string;
/** Platform-aware modifier key label (⌘ on Apple, Ctrl+ elsewhere). */
export declare function modKey(): string;
/** The reset-filters chord, as shown in hints: ⇧⌘⌫ on Apple platforms, Ctrl+Shift+Backspace elsewhere. */
export declare function resetKeyHint(mod?: string): string;
export declare function relativeTime(ts: number, now?: number): string;
/** hue (0–360) + lightness (0–100) → hex, fixed saturation for the picker gradient. */
export declare function hslToHex(h: number, l: number, s?: number): string;
