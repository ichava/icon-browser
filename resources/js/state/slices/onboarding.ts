// The product tour and the cookie consent answer.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import { loadSiteConsent, saveSiteConsent } from '@ichava/js-ui-kernel';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type OnboardingSlice = Pick<
  BrowserStore,
  'tour'
  | 'tourSeen'
  | 'startTour'
  | 'nextTourStep'
  | 'prevTourStep'
  | 'skipTour'
  | 'endTour'
  | 'consent'
  | 'setConsent'
>;

export function onboardingSlice(set: SetState, _get: GetState): OnboardingSlice {
  return {
    tour: { active: false, step: 0 },
    tourSeen: false,
    startTour: () => set({ tour: { active: true, step: 0 } }),
    nextTourStep: () => set((s) => ({ tour: { ...s.tour, step: s.tour.step + 1 } })),
    prevTourStep: () => set((s) => ({ tour: { ...s.tour, step: Math.max(0, s.tour.step - 1) } })),
    skipTour: () => set({ tour: { active: false, step: 0 }, tourSeen: true }),
    endTour: () => set({ tour: { active: false, step: 0 }, tourSeen: true }),

    // Site-wide (A6-gaps G17): every mount reads and writes one origin-level answer.
    consent: loadSiteConsent(),
    setConsent: (c) => {
      set({ consent: c });
      saveSiteConsent(c);
    },
  };
}
