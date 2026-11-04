import { type Locale, type MessageKey } from '../core/i18n';
/**
 * Returns a `t(key, vars?)` translator bound to the mount's locale and its own server
 * translation overrides (behaviour change 3), through @ichava/js-ui-kernel's Translator.
 *
 * A locale other than English is its own chunk (re-audit F-12): this loads it when the mount
 * switches to it and renders again when it lands. Until then `t` answers in English.
 */
export declare function useT(): (key: MessageKey, vars?: Record<string, string | number>) => string;
/**
 * Whether `locale`'s catalog is loaded, loading it when it is not. The browser shell waits on it
 * so a mount opening in, say, Arabic never paints a frame of English labels (re-audit F-12).
 */
export declare function useLocaleReady(locale: Locale): boolean;
