import type { HttpTransport } from '@/modules/catalog';

/**
 * The browser preferences a host keeps for its user, in the browser's terms. Each is
 * optional: a host stores what it validates, and the browser applies what came back.
 */
export interface HostPreferences {
  view?: 'grid' | 'list';
  size?: number;
  perPage?: number;
  sortBy?: 'name' | 'package' | 'category';
  sortOrder?: 'asc' | 'desc';
}

/** icon-browser's limits (`PreferenceUpdateRequest`); a value outside them is not sent. */
const LIMITS = { size: [24, 640], perPage: [12, 120] } as const;
const within = (n: number | undefined, [lo, hi]: readonly [number, number]) => n !== undefined && Number.isFinite(n) && n >= lo && n <= hi;

interface WirePreferences {
  preferences?: { view_mode?: string; icon_size?: number; per_page?: number };
  sorting?: { sort_by?: string; sort_direction?: string };
}

/** The wire payload for a preferences update: only values the host accepts. */
export function toWire(p: HostPreferences): WirePreferences {
  const prefs: NonNullable<WirePreferences['preferences']> = {};
  if (p.view) prefs.view_mode = p.view;
  if (within(p.size, LIMITS.size)) prefs.icon_size = p.size;
  if (within(p.perPage, LIMITS.perPage)) prefs.per_page = p.perPage;
  const sorting: NonNullable<WirePreferences['sorting']> = {};
  if (p.sortBy) sorting.sort_by = p.sortBy;
  if (p.sortOrder) sorting.sort_direction = p.sortOrder;
  return { ...(Object.keys(prefs).length ? { preferences: prefs } : {}), ...(Object.keys(sorting).length ? { sorting } : {}) };
}

/** The browser's preferences from what the host keeps; unknown or invalid values are dropped. */
export function fromWire(w: WirePreferences): HostPreferences {
  const out: HostPreferences = {};
  const p = w.preferences ?? {};
  const s = w.sorting ?? {};
  if (p.view_mode === 'grid' || p.view_mode === 'list') out.view = p.view_mode;
  if (within(p.icon_size, LIMITS.size)) out.size = p.icon_size;
  if (within(p.per_page, LIMITS.perPage)) out.perPage = p.per_page;
  if (s.sort_by === 'name' || s.sort_by === 'package' || s.sort_by === 'category') out.sortBy = s.sort_by;
  if (s.sort_direction === 'asc' || s.sort_direction === 'desc') out.sortOrder = s.sort_direction;
  return out;
}

/** Where a REST host keeps preferences, by the bootstrap map's `preferences.*` keys. */
export interface PreferenceEndpoints {
  /** `preferences.show`: GET. */
  show: string | null;
  /** `preferences.update`: POST. */
  update: string | null;
  /** `preferences.reset`: DELETE. */
  reset: string | null;
}

/**
 * Preferences kept by a REST host: GET to read, POST to update, DELETE to reset. Built
 * from one URL serving all three (`new RestPreferences(url, transport)`), or from the
 * host's REST map, one route each (`RestPreferences.withEndpoints(...)`), where a route
 * the host did not mount is skipped.
 */
export class RestPreferences {
  readonly #urls: PreferenceEndpoints;
  readonly #transport: HttpTransport;

  constructor(url: string, transport: HttpTransport) {
    this.#urls = { show: url, update: url, reset: url };
    this.#transport = transport;
  }

  /** Preferences at the routes the host's REST map names (`preferences.show`, `.update`, `.reset`). */
  static withEndpoints(endpoints: PreferenceEndpoints, transport: HttpTransport): RestPreferences {
    const prefs = new RestPreferences('', transport);
    prefs.#urls.show = endpoints.show;
    prefs.#urls.update = endpoints.update;
    prefs.#urls.reset = endpoints.reset;
    return prefs;
  }

  async load(): Promise<HostPreferences> {
    if (!this.#urls.show) return {};
    const res = await this.#transport.request<{ data?: WirePreferences }>(this.#urls.show, { baseUrl: '' });
    return fromWire(res.data ?? {});
  }

  async save(p: HostPreferences): Promise<void> {
    const body = toWire(p);
    if (!this.#urls.update || (!body.preferences && !body.sorting)) return;
    await this.#transport.request(this.#urls.update, { method: 'POST', body, baseUrl: '' });
  }

  async reset(): Promise<void> {
    if (!this.#urls.reset) return;
    await this.#transport.request(this.#urls.reset, { method: 'DELETE', baseUrl: '' });
  }
}
