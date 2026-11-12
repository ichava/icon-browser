// The per-mount instances a browser mount runs with (architecture 2.11, the composition
// root). The store is not here: it is the caller's (a prop, or `mountIchavaBrowser`'s
// default), so the existing ways of supplying one are unchanged.
import { pageLogger, type Logger } from '@/modules/telemetry';

/** Numbers each mount for its logger source and its `window.ichava.mounts` key. */
let mountCount = 0;

export interface BrowserRuntime {
  /** This mount's id: `ichava-1`, `ichava-2`, ... */
  readonly id: string;
  /** This mount's logger: a child of the page's, with its own level and entries (2.9). */
  readonly logger: Logger;
}

/** One mount's runtime. `IchavaBrowser` makes one per mount, once. */
export function createBrowserRuntime(): BrowserRuntime {
  const id = `ichava-${++mountCount}`;
  return { id, logger: pageLogger.child(id) };
}
