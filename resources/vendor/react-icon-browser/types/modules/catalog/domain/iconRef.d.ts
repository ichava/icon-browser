import type { Icon } from '@ichava/js-ui-kernel';
/**
 * `set:name` reference derived from package + name (e.g. tabler:home).
 *
 * A catalog fact, not a snippet one: snippets print it, exports write it into their
 * manifest, and search matches it. It lives beside `packShort`, the rule it is built on,
 * so the export module can use it without reaching into snippets.
 */
export declare function iconRef(icon: Icon): string;
