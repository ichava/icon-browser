import type { IconId } from '@ichava/js-ui-kernel';
/** A teammate a collection is shared with. */
export interface TeamRef {
    initials: string;
    name: string;
}
/** One recorded action on an icon: viewed, copied, downloaded... */
export interface HistoryEntry {
    id: IconId;
    action: string;
    ts: number;
}
export interface Collection {
    id: string;
    name: string;
    icons: IconId[];
    shared?: boolean;
    role?: 'editor' | 'viewer';
    sharedWith?: TeamRef[];
}
/** The persisted library: what the user kept, did and grouped. */
export interface LibraryState {
    favorites: IconId[];
    history: HistoryEntry[];
    collections: Collection[];
}
/**
 * The library aggregate (architecture.md 3.4): favourites, history and collections, with
 * their invariants in one place. Each change returns a new `Library`; the parts it did
 * not touch keep their identity, so a store applying it re-renders only what changed.
 *
 *   Library.from(state, { historyCap: 200 }).toggleFavorite(1204).record(1204, 'copied', Date.now())
 *
 * The rules are the ones the store applied inline: a new favourite goes to the front;
 * history keeps one entry per icon and action, newest first, capped; a collection needs a
 * non-blank name, never holds an icon twice, and keeps its name when renamed to blank.
 */
export declare class Library {
    #private;
    private constructor();
    static from(state: LibraryState, opts: {
        historyCap: number;
    }): Library;
    get favorites(): IconId[];
    get history(): HistoryEntry[];
    get collections(): Collection[];
    toggleFavorite(id: IconId): Library;
    /** Record `action` on `id` at `ts`: newest first, one entry per icon and action, capped. */
    record(id: IconId, action: string, ts: number): Library;
    clearHistory(): Library;
    /**
     * A new collection holding `icons` (none by default, each once, in order); a blank name
     * changes nothing. `newId` is only called when one is made.
     */
    createCollection(name: string, newId: () => string, icons?: readonly IconId[]): Library;
    /** Rename; a blank name keeps the old one. */
    renameCollection(id: string, name: string): Library;
    removeCollection(id: string): Library;
    /** Add an icon to a collection; one already in it is left alone. */
    addTo(collectionId: string, iconId: IconId): Library;
    removeFrom(collectionId: string, iconId: IconId): Library;
    share(id: string, opts: {
        role: 'editor' | 'viewer';
        sharedWith: TeamRef[];
    }): Library;
}
