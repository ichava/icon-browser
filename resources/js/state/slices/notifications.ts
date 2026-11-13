// The notification feed, and the demo seed a host must ask for.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import { NOTIFICATION_SEED } from '@/core/notifications';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type NotificationsSlice = Pick<
  BrowserStore,
  'notifications'
  | 'seedDemoNotifications'
  | 'pushNotification'
  | 'markNotificationsRead'
  | 'clearNotifications'
>;

let notifKey = 0;

export function notificationsSlice(set: SetState, _get: GetState): NotificationsSlice {
  return {
    notifications: [],
    seedDemoNotifications: () =>
      set((s) =>
        s.notifications.length
          ? {}
          : { notifications: NOTIFICATION_SEED.map((n, i) => ({ id: `seed-${i}`, icon: n.icon, text: n.text, ts: Date.now() - n.ageMin * 60000, read: n.read ?? false })) },
      ),
    pushNotification: (n) =>
      set((s) => ({ notifications: [{ id: `n-${++notifKey}`, icon: n.icon, text: n.text, ts: Date.now(), read: false }, ...s.notifications].slice(0, 50) })),
    markNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    clearNotifications: () => set({ notifications: [] }),
  };
}
