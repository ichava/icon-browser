import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type OnboardingSlice = Pick<BrowserStore, 'tour' | 'tourSeen' | 'startTour' | 'nextTourStep' | 'prevTourStep' | 'skipTour' | 'endTour' | 'consent' | 'setConsent'>;
export declare function onboardingSlice(set: SetState, _get: GetState): OnboardingSlice;
export {};
