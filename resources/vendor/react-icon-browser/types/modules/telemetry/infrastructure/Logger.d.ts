import type { AppConfig, LogLevel } from '../../../core/config';
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
type Sub = (e: LogEntry) => void;
/** The source tag of the page-level logger's entries. */
export declare const PAGE_LOG_SOURCE = "page";
export declare class Logger {
    #private;
    private level;
    private cap;
    private buf;
    private subs;
    constructor(source?: string, parent?: Logger | null);
    /** The source this logger tags its entries with. */
    get source(): string;
    /** A logger for one mount: its own level and entries, over this one's. */
    child(source: string): Logger;
    /** Apply the resolved level + buffer cap once config is known. */
    configure(config?: Pick<AppConfig, 'env' | 'debug' | 'features' | 'limits'> | null): void;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    /** Entries as they are written: a child hears its parent's too. */
    subscribe(fn: Sub): () => void;
    /** This logger's entries, and for a child its parent's too, in time order. */
    buffer(): readonly LogEntry[];
    clear(): void;
    private write;
    debug(channel: LogChannel, message: string, data?: unknown): void;
    info(channel: LogChannel, message: string, data?: unknown): void;
    warn(channel: LogChannel, message: string, data?: unknown): void;
    error(channel: LogChannel, message: string, data?: unknown): void;
}
/** The page-level logger: what code outside any mount writes to, and every mount's parent. */
export declare const pageLogger: Logger;
