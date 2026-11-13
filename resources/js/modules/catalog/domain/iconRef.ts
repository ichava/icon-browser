import type { Icon } from '@ichava/js-ui-kernel';
import { packShort } from './packShort';

/**
 * `set:name` reference derived from package + name (e.g. tabler:home).
 *
 * A catalog fact, not a snippet one: snippets print it, exports write it into their
 * manifest, and search matches it. It lives beside `packShort`, the rule it is built on,
 * so the export module can use it without reaching into snippets.
 */
export function iconRef(icon: Icon): string {
  return `${packShort(icon)}:${icon.name}`;
}
