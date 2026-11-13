import type { IconId } from '@ichava/js-ui-kernel';
import type { HttpTransport } from '@/modules/catalog';
import { fillEndpoint, type ApiEndpointKey } from '@/modules/host';
import type { Collection, HistoryEntry } from '../domain/Library';
import { CLIENT_VERBS, HISTORY_VERBS, type LibraryOp } from '../application/libraryDiff';

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

interface WireLibrary {
  favorites?: number[];
  collections?: { id: string; name: string; icon_ids?: number[] }[];
  history?: { icon_id: number; action: string; timestamp: string }[];
  commandHistory?: { command: string; timestamp: string }[];
}

/** What a collection create answers: the stored collection, its server id and icons. */
interface CreatedCollection {
  data?: { id?: string | number; icon_ids?: number[] };
}

/** The create request: the name, and the icons the collection starts with when it has any. */
const createBody = (op: Extract<LibraryOp, { kind: 'collection.create' }>) =>
  op.icons?.length ? { name: op.name, icon_ids: [...op.icons] } : { name: op.name };

const join = (base: string, ...parts: (string | number)[]) =>
  [base.replace(/\/+$/, ''), ...parts.map((p) => encodeURIComponent(String(p)))].join('/');

/**
 * The library kept by a REST host (icon-browser's `/api/v1` library routes), through the
 * mount's transport so CSRF, credentials and the browser id travel as for the catalog.
 */
export class RestLibrary {
  readonly #endpoints: LibraryEndpoints;
  readonly #transport: HttpTransport;
  /** Provisional collection ids (`c-…`) to the ids the server gave them. */
  readonly #ids = new Map<string, string>();

  constructor(endpoints: LibraryEndpoints, transport: HttpTransport) {
    this.#endpoints = endpoints;
    this.#transport = transport;
  }

  #send<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: unknown): Promise<T> {
    return this.#transport.request<T>(url, { method, body, baseUrl: '' });
  }

  /** The server's id for a collection, following a provisional one it has since replaced. */
  serverId(id: string): string {
    return this.#ids.get(id) ?? id;
  }

  async load(): Promise<RemoteLibrary> {
    const res = await this.#send<{ data?: WireLibrary }>(this.#endpoints.library);
    const lib = res.data ?? {};
    return {
      favorites: (lib.favorites ?? []).filter((x) => typeof x === 'number'),
      collections: (lib.collections ?? []).map((c) => ({ id: String(c.id), name: c.name, icons: [...(c.icon_ids ?? [])] })),
      history: (lib.history ?? []).map((h) => ({ id: h.icon_id, action: CLIENT_VERBS[h.action] ?? h.action, ts: Date.parse(h.timestamp) || 0 })),
      recentCommands: (lib.commandHistory ?? []).map((c) => c.command),
    };
  }

  /**
   * Send one operation. A collection created here comes back with the server's id; the
   * returned `{ from, to }` lets the caller swap its provisional id for that one.
   */
  async apply(op: LibraryOp): Promise<{ from: string; to: string } | void> {
    if (this.#endpoints.api) return this.#applyFromMap(op, this.#endpoints.api);
    const e = this.#endpoints;
    switch (op.kind) {
      case 'favorite.add':
        if (e.favorites) await this.#send(join(e.favorites, op.iconId), 'POST');
        return;
      case 'favorite.remove':
        if (e.favorites) await this.#send(join(e.favorites, op.iconId), 'DELETE');
        return;
      case 'history.record':
        if (e.history) await this.#send(e.history, 'POST', { icon_id: op.iconId, action: HISTORY_VERBS[op.action] ?? op.action });
        return;
      case 'history.clear':
        if (e.history) await this.#send(e.history, 'DELETE');
        return;
      case 'collection.create': {
        const base = e.collections;
        if (!base) return;
        return this.#create(op, () => this.#send(base, 'POST', createBody(op)), (id, iconId) => this.#send(join(base, id, 'icons', iconId), 'POST'));
      }
      case 'collection.rename':
        if (e.collections) await this.#send(join(e.collections, this.serverId(op.id)), 'PUT', { name: op.name });
        return;
      case 'collection.delete':
        if (e.collections) await this.#send(join(e.collections, this.serverId(op.id)), 'DELETE');
        return;
      case 'collection.add':
        if (e.collections) await this.#send(join(e.collections, this.serverId(op.id), 'icons', op.iconId), 'POST');
        return;
      case 'collection.remove':
        if (e.collections) await this.#send(join(e.collections, this.serverId(op.id), 'icons', op.iconId), 'DELETE');
        return;
      case 'command.log':
        if (e.commands) await this.#send(e.commands, 'POST', { command: op.command, type: 'action' });
        return;
      case 'command.clear':
        if (e.commands) await this.#send(e.commands, 'DELETE');
        return;
      case 'library.delete':
        await this.#send(e.library, 'DELETE');
        return;
    }
  }

  /**
   * Create a collection with its icons in one request (`icon_ids`), remember the id the
   * server gave it, and say which provisional id that replaces. An icon the answer does
   * not list is added on its own, so a host that predates `icon_ids` still ends up
   * holding every icon.
   */
  async #create(
    op: Extract<LibraryOp, { kind: 'collection.create' }>,
    post: () => Promise<CreatedCollection | null>,
    add: (id: string, iconId: IconId) => Promise<unknown>,
  ): Promise<{ from: string; to: string } | void> {
    const res = await post();
    const id = res?.data?.id;
    if (id === undefined) return;
    const to = String(id);
    this.#ids.set(op.id, to);
    const held = new Set(res?.data?.icon_ids ?? []);
    for (const iconId of op.icons ?? []) if (!held.has(iconId)) await add(to, iconId);
    return { from: op.id, to };
  }

  /** One operation, to the route the host's REST map names for it. No URL is built here. */
  async #applyFromMap(op: LibraryOp, api: Readonly<Partial<Record<ApiEndpointKey, string>>>): Promise<{ from: string; to: string } | void> {
    const at = (key: ApiEndpointKey, params: Record<string, string | number> = {}): string | null => {
      const url = api[key];
      return url ? fillEndpoint(url, params) : null;
    };
    const send = async (url: string | null, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) => (url ? this.#send<CreatedCollection>(url, method, body) : null);
    switch (op.kind) {
      case 'favorite.add':
        await send(at('favorites.add', { iconId: op.iconId }), 'POST');
        return;
      case 'favorite.remove':
        await send(at('favorites.remove', { iconId: op.iconId }), 'DELETE');
        return;
      case 'history.record':
        await send(at('history.log'), 'POST', { icon_id: op.iconId, action: HISTORY_VERBS[op.action] ?? op.action });
        return;
      case 'history.clear':
        await send(at('history.clear'), 'DELETE');
        return;
      case 'collection.create': {
        const url = at('collections.create');
        if (!url) return;
        return this.#create(op, () => send(url, 'POST', createBody(op)), (id, iconId) => send(at('collections.addIcon', { collectionId: id, iconId }), 'POST'));
      }
      case 'collection.rename':
        await send(at('collections.rename', { collectionId: this.serverId(op.id) }), 'PUT', { name: op.name });
        return;
      case 'collection.delete':
        await send(at('collections.delete', { collectionId: this.serverId(op.id) }), 'DELETE');
        return;
      case 'collection.add':
        await send(at('collections.addIcon', { collectionId: this.serverId(op.id), iconId: op.iconId }), 'POST');
        return;
      case 'collection.remove':
        await send(at('collections.removeIcon', { collectionId: this.serverId(op.id), iconId: op.iconId }), 'DELETE');
        return;
      case 'command.log':
        await send(at('commands.log'), 'POST', { command: op.command, type: 'action' });
        return;
      case 'command.clear':
        await send(at('commands.clear'), 'DELETE');
        return;
      case 'library.delete':
        await send(at('library.destroy'), 'DELETE');
        return;
    }
  }
}
