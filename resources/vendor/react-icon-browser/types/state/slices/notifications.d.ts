import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';
type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];
export type NotificationsSlice = Pick<BrowserStore, 'notifications' | 'seedDemoNotifications' | 'pushNotification' | 'markNotificationsRead' | 'clearNotifications'>;
export declare function notificationsSlice(set: SetState, _get: GetState): NotificationsSlice;
export {};
