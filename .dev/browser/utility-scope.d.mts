/** The attribute the component root, its overlay container and (standalone) <html> carry. */
export const UTILITY_SCOPE: string;
/** The same CSS with each `@layer utilities` body wrapped in `@scope (<scope>)`. */
export function scopeUtilities(css: string, scope?: string): string;
/** Vite plugin applying `scopeUtilities` to every emitted stylesheet. */
export function scopeUtilityLayer(scope?: string): import('vite').Plugin;
