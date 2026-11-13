import { diffLibrary as libraryDiffLibrary, type LibraryOp as LibraryOpOfLibrary, type LibraryView as LibraryViewOfLibrary } from '@/lib/browser';

/**
 * Library state as the server keeps it: favourites, history, collections, command-palette
 * recents and the count of "Delete my library" requests.
 *
 * The browser keeps these in its store and changes them in place. In this package the
 * server is the record, so every change the store makes is replayed against the Inertia
 * routes (`useLibrarySync`), and every reload's props are written back over the store. What
 * changed between two states is worked out by @ichava/react-icon-browser's `diffLibrary`,
 * the same diff its own REST sync replays, so the two hosts send the same operations.
 */
export type LibraryView = LibraryViewOfLibrary;

/**
 * One operation the server understands: favourites, history, collections, the command
 * history (`command.log`, `command.clear`) and "Delete my library" (`library.delete`).
 */
export type LibraryOp = LibraryOpOfLibrary;

/** Client history verbs to the server's (`HistoryController`: `in:view,copy,download`). */
export const HISTORY_VERBS: Readonly<Record<string, string>> = { viewed: 'view', copied: 'copy', downloaded: 'download' };

/** The server's verbs back to the client's, so a hydrated entry dedupes with a new one. */
export const CLIENT_VERBS: Readonly<Record<string, string>> = { view: 'viewed', copy: 'copied', download: 'downloaded' };

/**
 * What changed between two library states, as server operations: react-icon-browser's own
 * `diffLibrary`, re-exported so this package's callers keep their import.
 */
export { libraryDiffLibrary as diffLibrary };
