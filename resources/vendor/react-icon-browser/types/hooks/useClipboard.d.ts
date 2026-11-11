/**
 * Write to the clipboard, keeping the write inside the click that asked for it.
 *
 * A grid tile's copy text is built asynchronously (the SVG body is fetched first), and
 * Safari refuses `writeText` once an `await` has passed: the user activation is gone, so
 * the copy failed there while it worked in Chrome. `ClipboardItem` accepts a promise and
 * resolves it itself, which is the one shape every engine keeps inside the gesture. A
 * string still goes through `writeText`, and an engine without the async API gets the
 * `execCommand` fallback.
 */
export declare function writeClipboard(text: string | Promise<string>): Promise<void>;
/** Copy text with a graceful fallback + a toast, so callers stay one-liners. */
export declare function useCopy(): (text: string | Promise<string>, label?: string) => Promise<void>;
