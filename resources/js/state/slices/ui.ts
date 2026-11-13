// Which layer is open, the detail icon, toasts, the context menu and the confirm dialog.
// Moved verbatim from store.ts (architecture 2.10); store.ts composes the slices.
import type { StoreApi } from 'zustand';
import type { BrowserStore } from '../types';

type SetState = StoreApi<BrowserStore>['setState'];
type GetState = StoreApi<BrowserStore>['getState'];

export type UiSlice = Pick<
  BrowserStore,
  'layer'
  | 'detailId'
  | 'libTab'
  | 'librarySeed'
  | 'openLayer'
  | 'closeLayer'
  | 'openDetail'
  | 'openLibrary'
  | 'showToast'
  | 'dismissToast'
  | 'toasts'
  | 'ctx'
  | 'openCtx'
  | 'closeCtx'
  | 'confirm'
  | 'openConfirm'
  | 'closeConfirm'
  | 'tasks'
  | 'runTask'
>;

/** How long work may run before the task loader shows (Sim: tasks over 2 seconds). */
export const TASK_LOADER_DELAY_MS = 2000;

/** Monotonic task id; see `runTask`. */
let taskSeq = 0;

/** Monotonic toast id; see `showToast`. */
let toastSeq = 0;

export function uiSlice(set: SetState, get: GetState): UiSlice {
  return {
    layer: null,
    detailId: null,
    libTab: 'favorites',
    librarySeed: [],
    openLayer: (l) => set({ layer: l }),
    closeLayer: () => set({ layer: null, detailId: null, librarySeed: [] }),
    // Every way of opening an icon records a view -- the tile, the command palette, a
    // permalink, related icons, the library -- not only the grid tile (A6-gaps G9).
    // pushHistory de-duplicates, so a caller that also records one adds nothing.
    openDetail: (id) => {
      set({ layer: 'detail', detailId: id });
      get().pushHistory(id, 'viewed');
    },
    openLibrary: (tab, opts) => set({ layer: 'library', libTab: tab, librarySeed: [...new Set(opts?.seed ?? [])] }),

    /*
     * Toasts are STATE, not a side effect into a UI library.
     *
     * This called `sonner` directly, which put a UI import in the state layer -- finding
     * A7. The store now appends to a queue and `Toaster` renders it, so the store has no
     * opinion about how a toast looks, tests can assert on the queue, and a host
     * embedding the browser can render them its own way.
     *
     * Ids come from a monotonic counter rather than a timestamp, so two toasts raised in
     * the same millisecond cannot collide on their React key.
     */
    showToast: (msg, icon = 'check') =>
      set((s) => ({ toasts: [...s.toasts, { id: ++toastSeq, msg, icon }] })),
    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    toasts: [],

    /*
     * The task loader. A task is only listed once it has run for `delayMs`, so quick work
     * shows nothing; it leaves the list when the work settles, whether it resolved or not,
     * and the work's own result or error passes straight through.
     */
    tasks: [],
    runTask: async (label, work, opts) => {
      const id = ++taskSeq;
      const timer = setTimeout(() => set((s) => ({ tasks: [...s.tasks, { id, label }] })), opts?.delayMs ?? TASK_LOADER_DELAY_MS);
      try {
        return await work();
      } finally {
        clearTimeout(timer);
        set((s) => (s.tasks.some((t) => t.id === id) ? { tasks: s.tasks.filter((t) => t.id !== id) } : {}));
      }
    },

    ctx: null,
    openCtx: (x, y, items, title) => set({ ctx: { x, y, items, title } }),
    closeCtx: () => set({ ctx: null }),

    confirm: null,
    openConfirm: (c) => set({ confirm: c }),
    closeConfirm: () => set({ confirm: null }),
  };
}
