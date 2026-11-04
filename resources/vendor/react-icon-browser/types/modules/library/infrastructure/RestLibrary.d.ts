import type { IconId } from '@ichava/js-ui-kernel';
import type { HttpTransport } from '../../catalog';
import { type ApiEndpointKey } from '../../host';
import type { Collection, HistoryEntry } from '../domain/Library';
import { type LibraryOp } from '../application/libraryDiff';
/**
 * Where a REST host keeps the library. Every URL is absolute, from the bootstrap
 * document's REST map (see `restLibraryEndpoints` in the host module); a null one means
 * the host turned that feature off, and its operations are skipped.
 */
export interface LibraryEndpoints {
    /** `GET` the whole library, `DELETE` it ("Delete my library"). */
    library: string;
    /** Favourites; an icon at `{favorites}/{iconId}` (POST adds, DELETE removes). */
    favorites: string | null;
    /** Collections; one at `{collections}/{id}`, its icons at `{collections}/{id}/icons/{iconId}`. */
    collections: string | null;
    /** History: POST records, DELETE clears. */
    history: string | null;
    /** Command history: POST records, DELETE clears. */
    commands: string | null;
    /**
     * The bootstrap's REST map (`api.endpoints`). When given, each operation goes to the
     * route the host named for it (`favorites.add`, `collections.addIcon`, `history.log`,
     * `library.destroy`...), with its `{iconId}` and `{collectionId}` filled in, and an
     * operation whose route is absent is skipped. Without it, the URLs above are joined
     * as before.
     */
    api?: Readonly<Partial<Record<ApiEndpointKey, string>>>;
}
/** The library as it came back from `GET library`, in the store's shapes. */
export interface RemoteLibrary {
    favorites: IconId[];
    collections: Collection[];
    history: HistoryEntry[];
    recentCommands: string[];
}
/**
 * The library kept by a REST host (icon-browser's `/api/v1` library routes), through the
 * mount's transport so CSRF, credentials and the browser id travel as for the catalog.
 */
export declare class RestLibrary {
    #private;
    constructor(endpoints: LibraryEndpoints, transport: HttpTransport);
    /** The server's id for a collection, following a provisional one it has since replaced. */
    serverId(id: string): string;
    load(): Promise<RemoteLibrary>;
    /**
     * Send one operation. A collection created here comes back with the server's id; the
     * returned `{ from, to }` lets the caller swap its provisional id for that one.
     */
    apply(op: LibraryOp): Promise<{
        from: string;
        to: string;
    } | void>;
}
