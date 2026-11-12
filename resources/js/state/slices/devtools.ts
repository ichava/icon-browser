// The DevTools panel (ephemeral).
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import type { DevBus } from '@/modules/telemetry';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type DevtoolsSlice = Pick<
  BrowserStore,
  'devtools'
  | 'toggleDevtools'
  | 'setDevToolsTab'
  | 'pushDevEvent'
  | 'clearDevEvents'
  | 'setCapturing'
  | 'devtoolsLayout'
  | 'setDevtoolsDock'
  | 'setDevtoolsSize'
>;

/** The drawer's size limits, in px. The upper bound is also capped by the window at render. */
export const DEVTOOLS_SIZE = { min: 120, max: 1600, default: 260 } as const;

export function devtoolsSlice(set: SetState, _get: GetState, bus: DevBus): DevtoolsSlice {
  return {
    devtools: { open: false, tab: 'events', events: [], capturing: true },
    toggleDevtools: () =>
      set((s) => {
        const open = !s.devtools.open;
        bus.emit('devtools', 'devtools.toggle', { open });
        return { devtools: { ...s.devtools, open } };
      }),
    setDevToolsTab: (t) => set((s) => ({ devtools: { ...s.devtools, tab: t } })),
    pushDevEvent: (e) =>
      set((s) => (s.devtools.capturing ? { devtools: { ...s.devtools, events: [e, ...s.devtools.events].slice(0, 200) } } : {})),
    clearDevEvents: () => set((s) => ({ devtools: { ...s.devtools, events: [] } })),
    setCapturing: (v) => set((s) => ({ devtools: { ...s.devtools, capturing: v } })),
    devtoolsLayout: { dock: 'bottom', size: DEVTOOLS_SIZE.default },
    setDevtoolsDock: (dock) => set((s) => ({ devtoolsLayout: { ...s.devtoolsLayout, dock } })),
    setDevtoolsSize: (size) =>
      set((s) => ({ devtoolsLayout: { ...s.devtoolsLayout, size: Math.round(Math.min(DEVTOOLS_SIZE.max, Math.max(DEVTOOLS_SIZE.min, size))) } })),
  };
}
