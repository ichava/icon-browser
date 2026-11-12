import { Translator, type Catalogs } from '@ichava/js-ui-kernel';
import { EN, type MessageKey } from './locales/en';

// Lightweight, dependency-free i18n. Bundled message catalogs keyed by a stable
// dotted key; the current locale lives in the store. The Laravel backend can serve
// additional/override translations, which a mount's store adds on top for that mount only
// (the frontend stays fully functional standalone — server sync is optional).

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'sw' | 'ar';

export interface LocaleMeta {
  code: Locale;
  label: string; // endonym
  dir: 'ltr' | 'rtl';
}

/** Advertised locales (endonyms + text direction). */
export const LOCALES: LocaleMeta[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', dir: 'ltr' },
  { code: 'pt', label: 'Português', dir: 'ltr' },
  { code: 'sw', label: 'Kiswahili', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

export const DEFAULT_LOCALE: Locale = 'en';

export function localeDir(locale: Locale): 'ltr' | 'rtl' {
  return LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr';
}

export type { MessageKey };

/**
 * The catalogs other than English, each its own chunk (re-audit F-12): a mount loads the one it
 * needs (`loadLocale`) and renders again when it lands (`subscribeCatalogs`). Until then
 * `translate` answers in English, so nothing renders a bare key.
 */
const LOADERS: Record<Exclude<Locale, 'en'>, () => Promise<{ default: Partial<Record<MessageKey, string>> }>> = {
  es: () => import('./locales/es'),
  fr: () => import('./locales/fr'),
  de: () => import('./locales/de'),
  pt: () => import('./locales/pt'),
  sw: () => import('./locales/sw'),
  ar: () => import('./locales/ar'),
};

/** The loaded catalogs, by locale: English from the start, the others as they load. */
export const MESSAGES: Partial<Record<Locale, Record<string, string>>> & { en: Record<string, string> } = { en: EN };

const pending = new Map<Locale, Promise<void>>();
const listeners = new Set<() => void>();
let version = 0;

/** Whether `locale`'s catalog is in `MESSAGES`. */
export function isLocaleLoaded(locale: Locale): boolean {
  return MESSAGES[locale] !== undefined;
}

/** Loads `locale`'s catalog once; later calls share the same promise. Notifies subscribers when it lands. */
export function loadLocale(locale: Locale): Promise<void> {
  if (locale === 'en' || isLocaleLoaded(locale)) return Promise.resolve();
  const inFlight = pending.get(locale);
  if (inFlight) return inFlight;
  const load = LOADERS[locale]().then((module) => {
    MESSAGES[locale] = module.default as Record<string, string>;
    version++;
    for (const listener of listeners) listener();
  });
  pending.set(locale, load);
  return load;
}

/** Every catalog, for tests and for a host that wants them all up front. */
export async function loadAllLocales(): Promise<void> {
  await Promise.all(LOCALES.map((l) => loadLocale(l.code)));
}

/** Calls `listener` whenever a catalog lands. Returns the unsubscribe. */
export function subscribeCatalogs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Bumped each time a catalog lands: the snapshot `useSyncExternalStore` reads. */
export function catalogVersion(): number {
  return version;
}

/**
 * A key built at run time, such as `variant.${id}` for a variant the data names. It is
 * not checked: a key no catalog has renders as itself, as `translate` always did. Every
 * fixed key is a `MessageKey` literal instead, so this is the one greppable escape hatch.
 */
export function messageKey(key: string): MessageKey {
  return key as MessageKey;
}

/** Resolve a key for a locale, falling back to English, then the key itself. */
export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const raw = MESSAGES[locale]?.[key] ?? MESSAGES.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_m, name: string) => String(vars[name] ?? `{${name}}`));
}

/** Server overrides, per locale, as a mount's store holds them. */
export type TranslationOverrides = Partial<Record<Locale, Record<string, string>>>;

const NO_OVERRIDES: TranslationOverrides = {};

/**
 * A translator for one mount: the bundled catalogs under that mount's own server overrides, in
 * `locale`. The engine is @ichava/js-ui-kernel's `Translator`; lookup falls back through
 * the locale, then English, then the key, as `translate` does.
 */
export function translatorFor(locale: Locale, overrides: TranslationOverrides = NO_OVERRIDES): Translator {
  return Translator.of(MESSAGES as unknown as Catalogs).withOverrides(overrides).locale(locale);
}

/** `translate`, with a mount's own overrides. For call sites outside React. */
export function translateFor(
  state: { locale: Locale; translationOverrides?: TranslationOverrides },
  key: string,
  vars?: Record<string, string | number>,
): string {
  return translatorFor(state.locale, state.translationOverrides).t(key, vars);
}
