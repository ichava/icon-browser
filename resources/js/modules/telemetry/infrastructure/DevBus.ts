// Tiny typed event bus (plan Part B/E). Store actions emit app events; the DevTools
// "Events" tab subscribes for a live log. Set-backed so re-subscription can't dup;
// subscribers return a disposer (no leak). `payload?: unknown` — never `any`.
//
// Moved from core/devbus.ts (architecture 2.9) and given children, like the Logger: the
// page has one bus, which code outside any mount (BootGate) emits on, and each store has
// a child of it. A child's listeners hear the page's events and that store's own, each
// tagged with its `source`, so one mount's actions no longer show in another's Events tab.

export type DevEventKind = 'auth' | 'share' | 'collection' | 'notify' | 'nav' | 'reset' | 'storage' | 'boot' | 'devtools';

export interface DevEvent {
  kind: DevEventKind;
  label: string;
  payload?: unknown;
  ts: number;
  /** Who emitted it: `page` for the page bus, the store's id for a store's child. */
  source?: string;
}

type Handler = (e: DevEvent) => void;

/** The source tag of the page-level bus's events. */
export const PAGE_BUS_SOURCE = 'page';

export class DevBus {
  readonly #handlers = new Set<Handler>();
  readonly #source: string;
  readonly #parent: DevBus | null;

  constructor(source: string = PAGE_BUS_SOURCE, parent: DevBus | null = null) {
    this.#source = source;
    this.#parent = parent;
  }

  get source(): string {
    return this.#source;
  }

  /** A bus for one store: its own events, heard together with this one's. */
  child(source: string): DevBus {
    return new DevBus(source, this);
  }

  emit(kind: DevEventKind, label: string, payload?: unknown): void {
    const e: DevEvent = { kind, label, payload, ts: Date.now(), source: this.#source };
    this.#handlers.forEach((fn) => {
      try {
        fn(e);
      } catch {
        /* isolate listener errors */
      }
    });
  }

  /** Listen to this bus, and for a child to its parent's too. Returns a disposer. */
  on(fn: Handler): () => void {
    this.#handlers.add(fn);
    const off = this.#parent?.on(fn);
    return () => {
      this.#handlers.delete(fn);
      off?.();
    };
  }
}

/** The page-level bus: what code outside any mount emits on, and every store's parent. */
export const pageDevBus = new DevBus();
