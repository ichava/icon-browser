export { Library, type Collection, type HistoryEntry, type LibraryState, type TeamRef } from './domain/Library';
export { diffLibrary, HISTORY_VERBS, CLIENT_VERBS, type LibraryOp, type LibraryView } from './application/libraryDiff';
export { RestLibrary, type LibraryEndpoints, type RemoteLibrary } from './infrastructure/RestLibrary';
