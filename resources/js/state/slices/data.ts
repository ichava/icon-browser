// The data a mount shows and the config it runs under: catalog, filter facets, config, workspace.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import type { AppConfig } from '@/core/config';
import { DEFAULT_FILTERS } from '@/core/defaults';
import { fromHostUser } from '@/modules/identity';
import { appearanceFromConfig, renderFromConfig } from '../preferences';
import type { AuthStatus, Plan } from '../types';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type DataSlice = Pick<
  BrowserStore,
  'catalog'
  | 'filtersData'
  | 'config'
  | 'loading'
  | 'activeWorkspaceId'
  | 'setCatalog'
  | 'setFiltersData'
  | 'setConfig'
  | 'setActiveWorkspace'
>;

/**
 * Apply the config's `defaults` block — but only on a first run.
 *
 * These keys are all persisted, so on any later visit the user's own choices are
 * authoritative and this returns nothing. Precedence, lowest to highest:
 *
 *   core defaults  ->  config.defaults (server / app-config.json / mount options)
 *                  ->  the user's persisted state
 *
 * Without this the whole `defaults` block was inert: the store initialises from
 * CONFIG_DEFAULTS at module load, the config arrives later via setConfig, and
 * nothing ever read it. A host could not change the default package selection,
 * page size, sort, appearance or render options at all.
 */
function configDefaults(c: AppConfig, hadPersisted: boolean): Partial<BrowserStore> {
  if (hadPersisted) return {};
  const d = c.defaults;
  if (!d) return {};
  const a = d.appearance;
  const r = d.render;
  return {
    filters: {
      ...DEFAULT_FILTERS,
      packages: d.packages ?? DEFAULT_FILTERS.packages,
      perPage: d.perPage ?? DEFAULT_FILTERS.perPage,
      sortBy: d.sortBy ?? DEFAULT_FILTERS.sortBy,
      sortOrder: d.sortOrder ?? DEFAULT_FILTERS.sortOrder,
      // The host's initial kind (contract §2.3); icons otherwise.
      kind: d.kind ?? DEFAULT_FILTERS.kind,
    },
    // Each block over the shipped defaults, key by key (state/preferences.ts).
    ...(a && appearanceFromConfig(a)),
    ...(r && renderFromConfig(r)),
    ...(d.collections?.length ? { collections: d.collections } : {}),
  } as Partial<BrowserStore>;
}

export function dataSlice(set: SetState, _get: GetState, hadPersisted: boolean): DataSlice {
  return {
    catalog: null,
    filtersData: null,
    config: null,
    loading: true,
    activeWorkspaceId: null,
    setCatalog: (c) => set({ catalog: c, loading: false }),
    setFiltersData: (f) => set({ filtersData: f }),
    setConfig: (c) =>
      set((s) => {
        // Inside a host app the host's session is the only truth about who is signed in:
        // it replaces whatever this browser persisted, every time the config arrives.
        // Otherwise seed auth from config only once (guard against per-mount clobber of
        // a persisted sign-out). First run reflects config.user.mode.
        const seedAuth = c.host
          ? {
              auth: c.host.user ? { status: 'authed' as AuthStatus, user: fromHostUser(c.host.user) } : { status: 'guest' as AuthStatus, user: null },
              authInitialized: true,
            }
          : !s.authInitialized && c.user.mode === 'authenticated'
            ? {
                auth: {
                  status: 'authed' as AuthStatus,
                  user: { name: c.user.name, initials: c.user.initials, email: c.user.email, plan: c.user.plan as Plan },
                },
                authInitialized: true,
              }
            : {};
        // Keep a persisted, still-valid workspace choice; else seed from config.
        const persistedWs = s.activeWorkspaceId && c.user.workspaces.some((w) => w.id === s.activeWorkspaceId) ? s.activeWorkspaceId : null;
        return {
          config: c,
          activeWorkspaceId: persistedWs ?? c.user.workspaces.find((w) => w.active)?.id ?? c.user.workspaces[0]?.id ?? null,
          ...seedAuth,
          ...configDefaults(c, hadPersisted),
        };
      }),
    setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  };
}
