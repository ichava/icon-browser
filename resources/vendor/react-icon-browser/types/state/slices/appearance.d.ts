import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type AppearanceSlice = Pick<BrowserStore, 'theme' | 'accent' | 'radius' | 'scale' | 'density' | 'reduceMotion' | 'showLabels' | 'adaptMonochrome' | 'locale' | 'setLocale' | 'translationOverrides' | 'addTranslations' | 'setTheme' | 'toggleTheme' | 'setAccent' | 'setRadius' | 'setScale' | 'setDensity' | 'toggleReduceMotion' | 'toggleLabels' | 'toggleAdaptMonochrome'>;
export declare function appearanceSlice(set: SetState, _get: GetState): AppearanceSlice;
export {};
