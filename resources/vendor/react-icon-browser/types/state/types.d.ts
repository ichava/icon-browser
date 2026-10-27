import type { CopyFormat, SizeUnit, SortKey, Theme, Treatment, Scale, Density, ViewMode } from '../core/types';
import type { Catalog } from '../modules/catalog';
import type { Filters, IconId } from '@ichava/js-ui-kernel';
import type { AppConfig } from '../core/config';
import type { IconFilters } from '../modules/catalog';
import type { Collection, HistoryEntry, TeamRef } from '../modules/library';
import type { StorageDriver } from '../core/storage';
import type { Locale, TranslationOverrides } from '../core/i18n';
export type LibTab = 'favorites' | 'history' | 'collections';
export type Plan = 'FREE' | 'PRO' | 'TEAM';
export type AuthStatus = 'guest' | 'authed';
export type AuthView = null | 'signin' | 'create' | 'signout';
export type DevToolsTab = 'events' | 'state' | 'storage' | 'tests' | 'logs' | 'boot';
/** The edge the DevTools drawer docks to. */
export type DevToolsDock = 'bottom' | 'top' | 'left' | 'right';
export type BootPhase = 'idle' | 'config' | 'catalog' | 'index' | 'hydrate' | 'ready';
export interface AuthUser {
    name: string;
    initials: string;
    email: string;
    plan: Plan;
}
export interface AppNotification {
    id: string;
    icon: string;
    text: string;
    ts: number;
    read: boolean;
}
export interface DevToolsEvent {
    kind: string;
    label: string;
    payload?: unknown;
    ts: number;
    /** Who emitted it: `page`, or the store's bus id (architecture 2.9). */
    source?: string;
}
export interface BootStateSlice {
    phase: BootPhase;
    progress: number;
    label: string;
    done: boolean;
}
export type SearchScope = 'all' | 'icons' | 'packages' | 'categories';
export type Layer = null | 'palette' | 'library' | 'settings' | 'about' | 'detail' | 'profile';
export type { Collection, HistoryEntry, TeamRef };
/** UI-level filter state: the catalog module's `IconFilters`, under the name the store uses. */
export type FilterState = IconFilters;
export interface BrowserStore {
    catalog: Catalog | null;
    filtersData: Filters | null;
    config: AppConfig | null;
    loading: boolean;
    activeWorkspaceId: string | null;
    setCatalog: (c: Catalog) => void;
    setFiltersData: (f: Filters) => void;
    setConfig: (c: AppConfig) => void;
    setActiveWorkspace: (id: string) => void;
    theme: Theme;
    accent: string;
    radius: number;
    scale: Scale;
    density: Density;
    reduceMotion: boolean;
    showLabels: boolean;
    /** In dark mode, paint monochrome black icons in the text colour (FINDINGS B7). */
    adaptMonochrome: boolean;
    locale: Locale;
    setLocale: (l: Locale) => void;
    /** This mount's server translation overrides, per locale. Not persisted. */
    translationOverrides: TranslationOverrides;
    /** Merge server overrides into this mount's (later calls win, per key). */
    addTranslations: (data: TranslationOverrides) => void;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;
    setAccent: (hex: string) => void;
    setRadius: (n: number) => void;
    setScale: (s: Scale) => void;
    setDensity: (d: Density) => void;
    toggleReduceMotion: () => void;
    toggleLabels: () => void;
    toggleAdaptMonochrome: () => void;
    filters: FilterState;
    view: ViewMode;
    catQ: string;
    collapsedGroups: string[];
    /** categories expanded to reveal their subcategories (keys = `pack/category`). */
    expandedCats: string[];
    searchScope: SearchScope;
    packageQuery: string;
    sidebarOpen: boolean;
    setSearchScope: (s: SearchScope) => void;
    setPackageQuery: (v: string) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (v: boolean) => void;
    setSearch: (v: string) => void;
    clearSearch: () => void;
    togglePackage: (id: string) => void;
    selectAllPacks: (all: string[]) => void;
    clearPacks: () => void;
    toggleCat: (name: string) => void;
    toggleSub: (category: string, sub: string) => void;
    clearCats: () => void;
    setVariant: (v: string | null) => void;
    setSort: (k: SortKey) => void;
    toggleOrder: () => void;
    setPage: (n: number) => void;
    nextPage: (max: number) => void;
    prevPage: () => void;
    setPerPage: (n: number) => void;
    setView: (v: ViewMode) => void;
    setCatQ: (v: string) => void;
    toggleGroup: (pack: string) => void;
    toggleCatExpand: (key: string) => void;
    /** expand every group + category-with-subs, or collapse all if already expanded. */
    toggleExpandAll: (allGroups: string[], allCatKeys: string[]) => void;
    resetFilters: () => void;
    size: number;
    sizeUnit: SizeUnit;
    gridStroke: number;
    color: string | null;
    treatment: Treatment;
    copyFormat: CopyFormat;
    setSize: (n: number) => void;
    setSizeUnit: (u: SizeUnit) => void;
    setGridStroke: (n: number) => void;
    setColor: (c: string | null) => void;
    setTreatment: (t: Treatment) => void;
    setCopyFormat: (f: CopyFormat) => void;
    selection: IconId[];
    toggleSelect: (id: IconId) => void;
    clearSelection: () => void;
    favorites: IconId[];
    history: HistoryEntry[];
    collections: Collection[];
    toggleFavorite: (id: IconId) => void;
    pushHistory: (id: IconId, action: string) => void;
    clearHistory: () => void;
    createCollection: (name: string) => void;
    renameCollection: (id: string, name: string) => void;
    removeCollection: (id: string) => void;
    addToCollection: (collId: string, iconId: IconId) => void;
    removeFromCollection: (collId: string, iconId: IconId) => void;
    layer: Layer;
    detailId: IconId | null;
    libTab: LibTab;
    openLayer: (l: Layer) => void;
    closeLayer: () => void;
    openDetail: (id: IconId) => void;
    openLibrary: (tab: LibTab) => void;
    /** Live toast queue. Rendered by `Toaster`; the store never touches the DOM. */
    toasts: {
        id: number;
        msg: string;
        icon: string;
    }[];
    showToast: (msg: string, icon?: string) => void;
    dismissToast: (id: number) => void;
    /**
     * Work the user is waiting on that has run past the task-loader delay (2s by default).
     * Rendered by `TaskLoader`; quick work never appears here, so it never flickers.
     */
    tasks: {
        id: number;
        label: string;
    }[];
    /** Run `work`, showing `label` in the task loader if it takes longer than `delayMs` (2000). */
    runTask: <T>(label: string, work: () => Promise<T>, opts?: {
        delayMs?: number;
    }) => Promise<T>;
    ctx: {
        x: number;
        y: number;
        title?: string;
        items: ContextMenuItem[];
    } | null;
    openCtx: (x: number, y: number, items: ContextMenuItem[], title?: string) => void;
    closeCtx: () => void;
    setSelection: (ids: IconId[]) => void;
    auth: {
        status: AuthStatus;
        user: AuthUser | null;
    };
    authView: AuthView;
    authReason: string | null;
    authInitialized: boolean;
    openAuth: (view: Exclude<AuthView, null>, reason?: string) => void;
    closeAuth: () => void;
    signIn: (email: string, code: string) => boolean;
    createAccount: (p: {
        first: string;
        last: string;
        email: string;
    }) => void;
    signOut: () => void;
    notifications: AppNotification[];
    pushNotification: (n: {
        icon: string;
        text: string;
    }) => void;
    markNotificationsRead: () => void;
    clearNotifications: () => void;
    /**
     * Load the fabricated notification feed. Called once by the app when
     * `features.demo` is on, never on its own -- the seed used to be applied at
     * module init, which made invented activity a product default that no host
     * could switch off.
     */
    seedDemoNotifications: () => void;
    devtools: {
        open: boolean;
        tab: DevToolsTab;
        events: DevToolsEvent[];
        capturing: boolean;
    };
    /** Which edge the DevTools drawer docks to and its size along the other axis, in px. Persisted. */
    devtoolsLayout: {
        dock: DevToolsDock;
        size: number;
    };
    setDevtoolsDock: (dock: DevToolsDock) => void;
    setDevtoolsSize: (size: number) => void;
    toggleDevtools: () => void;
    setDevToolsTab: (t: DevToolsTab) => void;
    pushDevEvent: (e: DevToolsEvent) => void;
    clearDevEvents: () => void;
    setCapturing: (v: boolean) => void;
    inviteOpen: boolean;
    accessCollectionId: string | null;
    sharedOpen: boolean;
    openShared: () => void;
    closeShared: () => void;
    openInvite: () => void;
    closeInvite: () => void;
    openAccess: (id: string) => void;
    closeAccess: () => void;
    shareCollection: (id: string, opts: {
        role: 'editor' | 'viewer';
        sharedWith: TeamRef[];
    }) => void;
    storageDriver: StorageDriver;
    setStorageDriver: (d: StorageDriver) => void;
    tour: {
        active: boolean;
        step: number;
    };
    tourSeen: boolean;
    startTour: () => void;
    nextTourStep: () => void;
    prevTourStep: () => void;
    skipTour: () => void;
    endTour: () => void;
    consent: 'essential' | 'all' | null;
    setConsent: (c: 'essential' | 'all') => void;
    boot: BootStateSlice;
    setBoot: (b: Partial<BootStateSlice>) => void;
    confirm: ConfirmSpec | null;
    openConfirm: (c: ConfirmSpec) => void;
    closeConfirm: () => void;
    factoryReset: () => void;
}
export interface ContextMenuItem {
    label: string;
    icon?: string;
    run?: () => void;
    danger?: boolean;
    disabled?: boolean;
    divider?: boolean;
    kbd?: string;
}
export interface ConfirmSpec {
    title: string;
    body: string;
    confirmLabel: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
}
