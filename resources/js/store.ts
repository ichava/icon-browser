import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import type { Scale, Density } from '@/core/types';
import type { ListParams } from '@/core/api/ApiClient';
import type { AppConfig } from '@/core/config';
import { IconQuery } from '@/modules/catalog';
import { pageDevBus, type DevBus } from '@/modules/telemetry';
import type { IdentityProvider } from '@/modules/identity';
import { driverStorage, getDriver, hasPersisted, type StorageDriver } from '@/core/storage';
import { CONFIG_DEFAULTS } from '@/core/config';
import { type Locale } from '@/core/i18n';
import { loadSharedLocale } from '@ichava/js-ui-kernel';
import { resolveConsent } from '@ichava/js-ui-kernel';
import type { BrowserStore, FilterState } from './state/types';
import { dataSlice } from './state/slices/data';
import { appearanceSlice } from './state/slices/appearance';
import { browseSlice } from './state/slices/browse';
import { renderSlice } from './state/slices/render';
import { selectionSlice } from './state/slices/selection';
import { librarySlice } from './state/slices/library';
import { uiSlice } from './state/slices/ui';
import { identitySlice } from './state/slices/identity';
import { notificationsSlice } from './state/slices/notifications';
import { devtoolsSlice } from './state/slices/devtools';
import { collaborationSlice } from './state/slices/collaboration';
import { storageSlice } from './state/slices/storage';
import { onboardingSlice } from './state/slices/onboarding';
import { bootSlice } from './state/slices/boot';
import { resetSlice } from './state/slices/reset';

export type { Locale };

export type { Scale, Density, AppConfig, StorageDriver };
// The store's types live in state/types.ts (architecture 2.10), so the slices can name the
// whole store without importing this file. Every name is still exported from here.
export type {
  LibTab,
  Plan,
  AuthStatus,
  AuthView,
  DevToolsTab,
  DevToolsDock,
  BootPhase,
  AuthUser,
  AppNotification,
  DevToolsEvent,
  BootStateSlice,
  SearchScope,
  Layer,
  FilterState,
  BrowserStore,
  ContextMenuItem,
  ConfirmSpec,
} from './state/types';
// The library's types live with its aggregate (modules/library); same shapes, same names.
export type { Collection, HistoryEntry, TeamRef } from '@/modules/library';

/** `ListParams` for a filter state: one selected variant becomes a one-item list. */
export function toListParams(f: FilterState): ListParams {
  return IconQuery.from(f).toListParams();
}

/**
 * An in-memory PersistStorage for stores that must not persist. Used when
 * `persistKey` is null: a secondary mount should not write another mount's
 * preferences, and two stores sharing one key would sync through storage and stop
 * being independent at all.
 */
const ephemeralStorage: PersistStorage<unknown> = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export interface CreateStoreOptions {
  /**
   * localStorage key for the persisted slice. Pass a distinct key for a second
   * mount that should keep its own preferences, or `null` to not persist at all.
   *
   * Two stores sharing one key are not independent: they would sync through
   * storage even though they are separate instances.
   */
  persistKey?: string | null;
  /**
   * The bus this store's actions emit on (sign-in, sharing, storage, DevTools). Omit it
   * and the store gets its own child of the page bus, so its events reach its own mount's
   * Events tab and no other. Read it back with `devBusOf(store)`.
   */
  devBus?: DevBus;
  /**
   * Who signs in. Omit it and the store decides from its config: inside a host app
   * (`config.host`) the host's signed-in user through `HostIdentity`, otherwise the
   * frontend-only demo (`DemoIdentity`). A host with another arrangement passes its own.
   */
  identity?: IdentityProvider;
}

/** Numbers stores for their bus's source tag. */
let storeCount = 0;
/** Each store's bus, for `devBusOf`. A WeakMap, so a dropped store takes its bus with it. */
const busOf = new WeakMap<object, DevBus>();

/** The bus a store emits on: its own child of the page bus, or the one it was given. */
export function devBusOf(store: object): DevBus | undefined {
  return busOf.get(store);
}

/**
 * Build a browser store.
 *
 * Exists so a store can be created PER MOUNT. The module-level `useStore` below is
 * the default instance for the standalone app; two `<IchavaBrowser>` instances on one
 * page each get their own, so they no longer share filters, selection, favorites and
 * theme.
 *
 * Note the creator takes `(set, get)`. It previously took `(set)` alone, which is why
 * five actions reached for `useStore.getState()` -- meaning a per-mount store's own
 * actions would have read and written the singleton rather than themselves. That had
 * to be fixed before per-mount instances could work at all.
 */

export function createBrowserStore({ persistKey = CONFIG_DEFAULTS.storageKeys.persist, devBus, identity }: CreateStoreOptions = {}) {
  const bus = devBus ?? pageDevBus.child(`store-${++storeCount}`);
  // First-run detection for THIS mount's key, read before the persist middleware writes
  // (behaviour change 2). A mount that does not persist always applies config defaults.
  const hadPersisted = persistKey !== null && hasPersisted(persistKey);
  const store = create<BrowserStore>()(
  persist(
    // One slice per concern (state/slices/, architecture 2.10), composed into the same
    // BrowserStore. Each slice's keys are disjoint; state/types.test.ts checks they cover
    // every key of BrowserStore, no more and no fewer.
    (set, get) => ({
      ...dataSlice(set, get, hadPersisted),
      ...appearanceSlice(set, get),
      ...browseSlice(set, get),
      ...renderSlice(set, get),
      ...selectionSlice(set, get),
      ...librarySlice(set, get),
      ...uiSlice(set, get),
      ...identitySlice(set, get, bus, identity),
      ...notificationsSlice(set, get),
      ...devtoolsSlice(set, get, bus),
      ...collaborationSlice(set, get, bus),
      ...storageSlice(set, get, bus),
      ...onboardingSlice(set, get),
      ...bootSlice(set, get),
      ...resetSlice(set, get),
    }) satisfies BrowserStore,
    {
      // A null persistKey means "do not persist". zustand still requires a name, so
      // the STORAGE is swapped for an in-memory stub rather than the name omitted.
      name: persistKey ?? 'ichava.browser.ephemeral',
      // Version 5 since the 0.1.0 restyle. A stored appearance value is the user's, whatever it
      // is: nothing rewrites an old default into a new one (forward only, 2026-11-05).
      version: 5,
      // Driver-aware storage: swaps localStorage ↔ sessionStorage live (plan Part B).
      storage: persistKey === null ? ephemeralStorage : driverStorage,
      // Discard any persisted `filters` whose shape predates the IconResource
      // migration (old keys: cats/sub/sort/order) so rehydration can't poison it.
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Record<string, unknown>;
        const f = p.filters as Record<string, unknown> | undefined;
        if (f && (!Array.isArray(f.categories) || !('sortBy' in f))) delete p.filters;
        else if (f) {
          // Back-fill `subs` for filters persisted before the subcategory model.
          if (!Array.isArray(f.subs)) f.subs = [];
          // Version 4: icons and illustrations are top-level kinds, and tags and keywords
          // filter. Filters saved before open on icons, with no tag or keyword chosen.
          if (f.kind !== 'icon' && f.kind !== 'illustration') f.kind = 'icon';
          if (!Array.isArray(f.tags)) f.tags = [];
          if (!Array.isArray(f.keywords)) f.keywords = [];
        }
        if (Array.isArray(p.favorites) && p.favorites.some((x) => typeof x !== 'number')) p.favorites = [];
        // Scrub any `locale` from pre-existing blobs — it's no longer persisted here
        // (the shared `ichava.locale` key owns it); see `merge` + `partialize`.
        delete p.locale;
        return p as never;
      },
      // The shared `ichava.locale` key is authoritative for locale. Force it here so a
      // stale persisted blob (from before locale left `partialize`) can't clobber the
      // value `loadSharedLocale()` seeded at init — which would break the language handoff
      // with a landing page on the same origin.
      //
      // Consent likewise: the site-wide key wins, and a per-mount answer from before it
      // existed is adopted once (resolveConsent writes it to the site-wide key). The
      // per-mount field stays in the persisted shape.
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        locale: loadSharedLocale(),
        consent: resolveConsent((persisted as { consent?: unknown } | undefined)?.consent),
      }),
      partialize: (s) => ({
        theme: s.theme,
        accent: s.accent,
        radius: s.radius,
        scale: s.scale,
        density: s.density,
        reduceMotion: s.reduceMotion,
        showLabels: s.showLabels,
        adaptMonochrome: s.adaptMonochrome,
        // NOTE: `locale` is deliberately NOT persisted here. The shared
        // `ichava.locale` key (localeShare.ts) is the single source of truth so the
        // language handoff with the landing page holds; persisting it in this blob would let a
        // stale rehydrated value clobber loadSharedLocale() (no `merge` is defined).
        filters: s.filters,
        view: s.view,
        searchScope: s.searchScope,
        size: s.size,
        sizeUnit: s.sizeUnit,
        gridStroke: s.gridStroke,
        color: s.color,
        treatment: s.treatment,
        copyFormat: s.copyFormat,
        favorites: s.favorites,
        history: s.history,
        collections: s.collections,
        // demo systems (plan Part B)
        auth: s.auth,
        authInitialized: s.authInitialized,
        activeWorkspaceId: s.activeWorkspaceId,
        notifications: s.notifications,
        storageDriver: s.storageDriver,
        tourSeen: s.tourSeen,
        consent: s.consent,
        devtoolsLayout: s.devtoolsLayout,
      }),
      // Emit a storage-restore event + notification when prefs rehydrate (parity).
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const keys = Object.keys(state).length;
        bus.emit('storage', 'state.restore', { driver: getDriver(), keys });
      },
    },
  ),
  );
  busOf.set(store, bus);
  return store;
}

/**
 * The default store instance.
 *
 * Retained as a module singleton for the standalone app and for the 259 call sites
 * that read it directly. A per-mount instance is provided through context instead --
 * see `hooks/useStoreApi`.
 */
export const useStore = createBrowserStore();

/** The type of a store instance, for props and context. */
export type BrowserStoreHook = typeof useStore;
