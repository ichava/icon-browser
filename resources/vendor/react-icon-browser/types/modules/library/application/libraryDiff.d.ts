import type { IconId } from '@ichava/js-ui-kernel';
import type { Collection, HistoryEntry } from '../domain/Library';
/**
 * The library as a server keeps it: favourites, history, collections, command-palette
 * recents, and the count of "Delete my library" requests.
 *
 * The browser changes these in its own store (the Library aggregate). Inside a host the
 * server is the record, so every change is replayed against it; this file is the pure
 * half, what changed between two states as the operations the server understands. The
 * Inertia host (icon-browser) and the REST sync in this package replay the same list.
 */
export interface LibraryView {
    favorites: readonly IconId[];
    history: readonly HistoryEntry[];
    collections: readonly Collection[];
    recentCommands?: readonly string[];
    libraryDeletions?: number;
}
export type LibraryOp = {
    kind: 'favorite.add';
    iconId: IconId;
} | {
    kind: 'favorite.remove';
    iconId: IconId;
} | {
    kind: 'history.record';
    iconId: IconId;
    action: string;
} | {
    kind: 'history.clear';
} | {
    kind: 'collection.create';
    id: string;
    name: string;
} | {
    kind: 'collection.rename';
    id: string;
    name: string;
} | {
    kind: 'collection.delete';
    id: string;
} | {
    kind: 'collection.add';
    id: string;
    iconId: IconId;
} | {
    kind: 'collection.remove';
    id: string;
    iconId: IconId;
} | {
    kind: 'command.log';
    command: string;
} | {
    kind: 'command.clear';
} | {
    kind: 'library.delete';
};
/** Client history verbs to the server's (`RecordHistory::ACTIONS`: view, copy, download). */
export declare const HISTORY_VERBS: Readonly<Record<string, string>>;
/** The server's verbs back to the client's, so a hydrated entry dedupes with a new one. */
export declare const CLIENT_VERBS: Readonly<Record<string, string>>;
export declare function diffLibrary(prev: LibraryView, next: LibraryView): LibraryOp[];
