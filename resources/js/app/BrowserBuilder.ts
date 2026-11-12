// The `browser()` builder (architecture 3.4, 3.5, step 2.11): the choices a mount takes,
// one call each, on an immutable value. `mountIchavaBrowser(el, options)` and
// `<IchavaBrowser {...props}>` stay as they are; the builder feeds them, so the three
// paths run the same code.
//
// This file imports types only. The mount and store factories arrive as ports from
// `mount.tsx`, which is what keeps it testable without React and outside the app layer.

import type { Catalog } from '@/modules/catalog';
import type { IconCatalog } from '@/core/api/ApiClient';
import type { IchavaBrowserProps } from '@/IchavaBrowser';
import type { AppConfig, BrowserStoreHook } from '@/store';
import type { Locale } from '@/core/i18n';
import { isLocale } from '@ichava/js-ui-kernel';

/**
 * `mountIchavaBrowser`'s options (`MountOptions`), spelled from the component's props so this file does
 * not import `mount.tsx` (which imports it). The port's type check in `browser()` keeps
 * the two in step.
 */
export type BuilderMountOptions = IchavaBrowserProps & { persistKey?: string | null };

/** A mounted browser. `using handle = browser()...mount(el)` unmounts it at the end of the scope. */
export interface BrowserHandle {
  /** The store this mount reads and writes. */
  readonly store: BrowserStoreHook;
  unmount(): void;
  [Symbol.dispose](): void;
}

/** What the builder needs from the app: the existing mount function and store factory. */
export interface BrowserBuilderPorts {
  mount(el: HTMLElement, options: BuilderMountOptions): { unmount(): void };
  createStore(options: { persistKey?: string | null }): BrowserStoreHook;
}

interface State {
  readonly catalog?: Catalog;
  readonly client?: IconCatalog;
  readonly config?: AppConfig | null;
  readonly manageDocument?: boolean;
  readonly syncUrl?: boolean;
  readonly urlPrefix?: string;
  readonly store?: BrowserStoreHook;
  /** Absent: the mount path's own default. `null`: memory only. */
  readonly persistKey?: string | null;
  readonly locale?: Locale;
}

/**
 * Immutable: every call returns a new frozen builder, so a half-built one can be reused.
 * A data source is required, and setting one replaces the other: `catalog()` and
 * `rest()` are mutually exclusive, as `catalog` and `client` are on the component.
 */
export class BrowserBuilder {
  readonly #ports: BrowserBuilderPorts;
  readonly #state: State;
  /** `toProps()` creates a store at most once per builder, so repeated calls agree. */
  #propsStore: BrowserStoreHook | undefined;

  constructor(ports: BrowserBuilderPorts, state: State = {}) {
    this.#ports = ports;
    this.#state = Object.freeze({ ...state });
    Object.seal(this);
  }

  #with(patch: Partial<State>): BrowserBuilder {
    return new BrowserBuilder(this.#ports, { ...this.#state, ...patch });
  }

  /** A pre-loaded static catalog. Replaces any `rest()` client. */
  catalog(catalog: Catalog): BrowserBuilder {
    const { client: _drop, ...rest } = this.#state;
    return new BrowserBuilder(this.#ports, { ...rest, catalog });
  }

  /** A live data client, e.g. `RestCatalog.at('/admin/ichava/api/v1').csrf('cookie')`. Replaces any `catalog()`. */
  rest(client: IconCatalog): BrowserBuilder {
    const { catalog: _drop, ...rest } = this.#state;
    return new BrowserBuilder(this.#ports, { ...rest, client });
  }

  config(config: AppConfig | null): BrowserBuilder {
    return this.#with({ config });
  }

  /** Keep this mount's preferences under its own storage key. */
  persist(key: string): BrowserBuilder {
    return this.#with({ persistKey: key });
  }

  /** Keep this mount's preferences in memory only: usually right for a secondary mount. */
  ephemeral(): BrowserBuilder {
    return this.#with({ persistKey: null });
  }

  /** Use this store, e.g. to share state deliberately. Overrides `persist()`/`ephemeral()`. */
  store(store: BrowserStoreHook): BrowserBuilder {
    return this.#with({ store });
  }

  /** The whole page: own the document (`manageDocument`) and the address bar (`syncUrl`). */
  standalone(): BrowserBuilder {
    return this.#with({ manageDocument: true, syncUrl: true });
  }

  /** A mount inside a host page, which keeps its document and URL. The default. */
  embedded(): BrowserBuilder {
    return this.#with({ manageDocument: false, syncUrl: false });
  }

  /** Mirror filter state into the address bar, optionally under a parameter prefix. */
  syncUrl(prefix?: string): BrowserBuilder {
    return this.#with(prefix === undefined ? { syncUrl: true } : { syncUrl: true, urlPrefix: prefix });
  }

  /** Open in this language (the host's choice); the user can still switch. Unknown codes throw. */
  locale(locale: Locale): BrowserBuilder {
    if (!isLocale(locale)) throw new RangeError(`browser(): unknown locale "${String(locale)}"`);
    return this.#with({ locale });
  }

  #source(): Pick<BuilderMountOptions, 'catalog' | 'client'> {
    const { catalog, client } = this.#state;
    if (!catalog && !client) throw new Error('browser(): call .catalog(catalog) or .rest(client) before mounting.');
    return catalog ? { catalog } : { client: client! };
  }

  #storeFor(): BrowserStoreHook | undefined {
    const { store, persistKey } = this.#state;
    if (store) return store;
    if (persistKey === undefined) return undefined;
    return this.#ports.createStore({ persistKey });
  }

  /**
   * The `mountIchavaBrowser` options these choices make. A store is passed only when
   * `store()` was called; `persist()`/`ephemeral()` travel as `persistKey`.
   */
  toOptions(): BuilderMountOptions {
    const s = this.#state;
    const out: BuilderMountOptions = { ...this.#source() };
    if (s.config !== undefined) out.config = s.config;
    if (s.manageDocument !== undefined) out.manageDocument = s.manageDocument;
    if (s.syncUrl !== undefined) out.syncUrl = s.syncUrl;
    if (s.urlPrefix !== undefined) out.urlPrefix = s.urlPrefix;
    if (s.locale !== undefined) out.locale = s.locale;
    if (s.store) out.store = s.store;
    else if (s.persistKey !== undefined) out.persistKey = s.persistKey;
    return out;
  }

  /**
   * Props for `<IchavaBrowser>`. With `persist()` or `ephemeral()` this creates the
   * mount's store, once per builder: build it once (outside render) and reuse it.
   * Without either, no store is passed, and the component uses its own default.
   */
  toProps(): IchavaBrowserProps {
    const { persistKey: _key, store: _store, ...options } = this.toOptions();
    this.#propsStore ??= this.#storeFor();
    return this.#propsStore ? { ...options, store: this.#propsStore } : options;
  }

  /** `mountIchavaBrowser(el, options)`, returning the store with the handle. */
  mount(el: HTMLElement): BrowserHandle {
    const options = this.toOptions();
    // The same default mountIchavaBrowser applies, made here so the handle can hold it.
    const store = options.store ?? this.#ports.createStore(options.persistKey === undefined ? {} : { persistKey: options.persistKey });
    const root = this.#ports.mount(el, { ...options, store });
    let mounted = true;
    const unmount = () => {
      if (!mounted) return;
      mounted = false;
      root.unmount();
    };
    return { store, unmount, [Symbol.dispose]: unmount };
  }
}
