import { Translator } from '@ichava/js-ui-kernel';
import { type MessageKey } from './locales/en';
export type Locale = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'sw' | 'ar';
export interface LocaleMeta {
    code: Locale;
    label: string;
    dir: 'ltr' | 'rtl';
}
/** Advertised locales (endonyms + text direction). */
export declare const LOCALES: LocaleMeta[];
export declare const DEFAULT_LOCALE: Locale;
export declare function localeDir(locale: Locale): 'ltr' | 'rtl';
export type { MessageKey };
/** The loaded catalogs, by locale: English from the start, the others as they load. */
export declare const MESSAGES: Partial<Record<Locale, Record<string, string>>> & {
    en: Record<string, string>;
};
/** Whether `locale`'s catalog is in `MESSAGES`. */
export declare function isLocaleLoaded(locale: Locale): boolean;
/** Loads `locale`'s catalog once; later calls share the same promise. Notifies subscribers when it lands. */
export declare function loadLocale(locale: Locale): Promise<void>;
/** Every catalog, for tests and for a host that wants them all up front. */
export declare function loadAllLocales(): Promise<void>;
/** Calls `listener` whenever a catalog lands. Returns the unsubscribe. */
export declare function subscribeCatalogs(listener: () => void): () => void;
/** Bumped each time a catalog lands: the snapshot `useSyncExternalStore` reads. */
export declare function catalogVersion(): number;
/**
 * A key built at run time, such as `variant.${id}` for a variant the data names. It is
 * not checked: a key no catalog has renders as itself, as `translate` always did. Every
 * fixed key is a `MessageKey` literal instead, so this is the one greppable escape hatch.
 */
export declare function messageKey(key: string): MessageKey;
/** Resolve a key for a locale, falling back to English, then the key itself. */
export declare function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string;
/** Server overrides, per locale, as a mount's store holds them. */
export type TranslationOverrides = Partial<Record<Locale, Record<string, string>>>;
/**
 * A translator for one mount: the bundled catalogs under that mount's own server overrides, in
 * `locale`. The engine is @ichava/js-ui-kernel's `Translator`; lookup falls back through
 * the locale, then English, then the key, as `translate` does.
 */
export declare function translatorFor(locale: Locale, overrides?: TranslationOverrides): Translator;
/** `translate`, with a mount's own overrides. For call sites outside React. */
export declare function translateFor(state: {
    locale: Locale;
    translationOverrides?: TranslationOverrides;
}, key: string, vars?: Record<string, string | number>): string;
