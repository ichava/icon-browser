import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import { catalogVersion, isLocaleLoaded, loadLocale, subscribeCatalogs, translatorFor, type Locale, type MessageKey } from '@/core/i18n';
import { useAppStore } from '@/hooks/useStoreApi';

/**
 * Returns a `t(key, vars?)` translator bound to the mount's locale and its own server
 * translation overrides (behaviour change 3), through @ichava/js-ui-kernel's Translator.
 *
 * A locale other than English is its own chunk (re-audit F-12): this loads it when the mount
 * switches to it and renders again when it lands. Until then `t` answers in English.
 */
export function useT(): (key: MessageKey, vars?: Record<string, string | number>) => string {
  const locale = useAppStore((s) => s.locale);
  const overrides = useAppStore((s) => s.translationOverrides);
  const loaded = useSyncExternalStore(subscribeCatalogs, catalogVersion, catalogVersion);
  useEffect(() => {
    void loadLocale(locale);
  }, [locale]);
  // `loaded` is read so a catalog landing builds a new translator over it.
  const translator = useMemo(() => {
    void loaded;
    return translatorFor(locale, overrides);
  }, [locale, overrides, loaded]);
  return useCallback((key: MessageKey, vars?: Record<string, string | number>) => translator.t(key, vars), [translator]);
}

/**
 * Whether `locale`'s catalog is loaded, loading it when it is not. The browser shell waits on it
 * so a mount opening in, say, Arabic never paints a frame of English labels (re-audit F-12).
 */
export function useLocaleReady(locale: Locale): boolean {
  useSyncExternalStore(subscribeCatalogs, catalogVersion, catalogVersion);
  useEffect(() => {
    void loadLocale(locale);
  }, [locale]);
  return isLocaleLoaded(locale);
}
