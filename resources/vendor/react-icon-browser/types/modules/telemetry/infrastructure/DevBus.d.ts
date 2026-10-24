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
export declare const PAGE_BUS_SOURCE = "page";
export declare class DevBus {
    #private;
    constructor(source?: string, parent?: DevBus | null);
    get source(): string;
    /** A bus for one store: its own events, heard together with this one's. */
    child(source: string): DevBus;
    emit(kind: DevEventKind, label: string, payload?: unknown): void;
    /** Listen to this bus, and for a child to its parent's too. Returns a disposer. */
    on(fn: Handler): () => void;
}
/** The page-level bus: what code outside any mount emits on, and every store's parent. */
export declare const pageDevBus: DevBus;
export {};
