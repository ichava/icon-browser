// Theme, accent, radius, scale, density, motion, labels, locale and per-mount translation overrides.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import { appearanceDefaults } from '../preferences';
import type { Locale, TranslationOverrides } from '@/core/i18n';
import { loadSharedLocale, saveSharedLocale } from '@ichava/js-ui-kernel';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type AppearanceSlice = Pick<
  BrowserStore,
  'theme'
  | 'accent'
  | 'radius'
  | 'scale'
  | 'density'
  | 'reduceMotion'
  | 'showLabels'
  | 'adaptMonochrome'
  | 'locale'
  | 'setLocale'
  | 'translationOverrides'
  | 'addTranslations'
  | 'setTheme'
  | 'toggleTheme'
  | 'setAccent'
  | 'setRadius'
  | 'setScale'
  | 'setDensity'
  | 'toggleReduceMotion'
  | 'toggleLabels'
  | 'toggleAdaptMonochrome'
>;

export function appearanceSlice(set: SetState, _get: GetState): AppearanceSlice {
  return {
    ...appearanceDefaults(),
    locale: loadSharedLocale(),
    setLocale: (l) => { saveSharedLocale(l); set({ locale: l }); },
    translationOverrides: {},
    addTranslations: (data) =>
      set((s) => {
        const next: TranslationOverrides = { ...s.translationOverrides };
        for (const [loc, dict] of Object.entries(data) as [Locale, Record<string, string>][]) next[loc] = { ...(next[loc] ?? {}), ...dict };
        return { translationOverrides: next };
      }),
    setTheme: (t) => set({ theme: t }),
    toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    setAccent: (hex) => set({ accent: hex }),
    setRadius: (n) => set({ radius: n }),
    setScale: (sc) => set({ scale: sc }),
    setDensity: (d) => set({ density: d }),
    toggleReduceMotion: () => set((s) => ({ reduceMotion: !s.reduceMotion })),
    toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
    toggleAdaptMonochrome: () => set((s) => ({ adaptMonochrome: !s.adaptMonochrome })),
  };
}
