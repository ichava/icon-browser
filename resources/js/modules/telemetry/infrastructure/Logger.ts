// Structured logger (plan Part E). Leveled + namespaced channels, a ring buffer,
// and sinks: the browser console (gated by the resolved level) + subscribers (the
// DevTools "Logs" tab). Replaces ad-hoc console.* so a production build stays quiet
// unless debug is explicitly enabled. LOGIC only — no `any`.
//
// Moved from core/logger.ts (architecture 2.9), and given children: the page has one
// logger, which code outside any mount (BootGate) writes to, and each mount has a child
// of it. A child keeps its own level and buffer, so one mount's config no longer sets
// another's level, and its view (`buffer()`, `subscribe()`) is the page's entries plus
// its own, each tagged with its `source`.

import type { AppConfig, LogLevel } from '@/core/config';
import { resolveMode, isDebugEnabled } from '@/core/env';

export type { LogLevel };
export type LogChannel = 'boot' | 'api' | 'store' | 'devtools' | 'motion' | 'auth' | 'app';

export interface LogEntry {
  ts: number;
  level: Exclude<LogLevel, 'silent'>;
  channel: LogChannel;
  message: string;
  data?: unknown;
  /** Who wrote it: `page` for the page logger, the mount's id for a mount's child. */
  source?: string;
}

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

type Sub = (e: LogEntry) => void;

/** Write order across every logger, so a child's merged view is exact within one millisecond. */
const ORDER_OF = new WeakMap<LogEntry, number>();
let written = 0;

/** The source tag of the page-level logger's entries. */
export const PAGE_LOG_SOURCE = 'page';

export class Logger {
  private level: LogLevel = 'debug';
  private cap = 300;
  private buf: LogEntry[] = [];
  private subs = new Set<Sub>();
  readonly #source: string;
  readonly #parent: Logger | null;
  /** A child's Clear hides the parent's entries written before it, without clearing the page's own log. */
  #parentSince = 0;

  constructor(source: string = PAGE_LOG_SOURCE, parent: Logger | null = null) {
    this.#source = source;
    this.#parent = parent;
  }

  /** The source this logger tags its entries with. */
  get source(): string {
    return this.#source;
  }

  /** A logger for one mount: its own level and entries, over this one's. */
  child(source: string): Logger {
    return new Logger(source, this);
  }

  /** Apply the resolved level + buffer cap once config is known. */
  configure(config?: Pick<AppConfig, 'env' | 'debug' | 'features' | 'limits'> | null): void {
    if (config?.limits?.logBuffer) this.cap = config.limits.logBuffer;
    const configured = config?.debug?.logLevel;
    if (configured) this.level = configured;
    else this.level = isDebugEnabled(config) ? 'debug' : resolveMode(config) === 'production' ? 'warn' : 'debug';
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
  getLevel(): LogLevel {
    return this.level;
  }

  /** Entries as they are written: a child hears its parent's too. */
  subscribe(fn: Sub): () => void {
    this.subs.add(fn);
    const off = this.#parent?.subscribe(fn);
    return () => {
      this.subs.delete(fn);
      off?.();
    };
  }

  /** This logger's entries, and for a child its parent's too, in time order. */
  buffer(): readonly LogEntry[] {
    if (!this.#parent) return this.buf;
    const inherited = this.#parent.buffer().filter((e) => ORDER_OF.get(e)! > this.#parentSince);
    if (!inherited.length) return this.buf;
    return [...inherited, ...this.buf].sort((a, b) => ORDER_OF.get(a)! - ORDER_OF.get(b)!);
  }
  clear(): void {
    this.buf = [];
    this.#parentSince = written;
  }

  private write(level: Exclude<LogLevel, 'silent'>, channel: LogChannel, message: string, data?: unknown): void {
    const entry: LogEntry = { ts: Date.now(), level, channel, message, data, source: this.#source };
    ORDER_OF.set(entry, ++written);
    // ring buffer regardless of level so the DevTools Logs tab can show everything
    this.buf.push(entry);
    if (this.buf.length > this.cap) this.buf.splice(0, this.buf.length - this.cap);
    this.subs.forEach((fn) => {
      try {
        fn(entry);
      } catch {
        /* isolate sink errors */
      }
    });
    if (ORDER[level] >= ORDER[this.level] && this.level !== 'silent') {
      const tag = `[ichava:${channel}]`;
      const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : level === 'info' ? console.info : console.debug;
      if (data !== undefined) fn(tag, message, data);
      else fn(tag, message);
    }
  }

  debug(channel: LogChannel, message: string, data?: unknown): void {
    this.write('debug', channel, message, data);
  }
  info(channel: LogChannel, message: string, data?: unknown): void {
    this.write('info', channel, message, data);
  }
  warn(channel: LogChannel, message: string, data?: unknown): void {
    this.write('warn', channel, message, data);
  }
  error(channel: LogChannel, message: string, data?: unknown): void {
    this.write('error', channel, message, data);
  }
}

/** The page-level logger: what code outside any mount writes to, and every mount's parent. */
export const pageLogger = new Logger();
