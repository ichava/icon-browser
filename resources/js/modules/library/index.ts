// The library bounded context (architecture.md 3.2): favourites, history and collections,
// the diff a host replays against its server, and the REST gateway that replays it.
// Other modules and the app reach it only through this file.
export { Library, type Collection, type HistoryEntry, type LibraryState, type TeamRef } from './domain/Library';
export { diffLibrary, HISTORY_VERBS, CLIENT_VERBS, type LibraryOp, type LibraryView } from './application/libraryDiff';
export { RestLibrary, type LibraryEndpoints, type RemoteLibrary } from './infrastructure/RestLibrary';
