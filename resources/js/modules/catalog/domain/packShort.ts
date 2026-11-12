import type { Icon } from '@ichava/js-ui-kernel';

/**
 * `ichava/icon-sets-tabler` -> `tabler`: the vendor token, with our own `icon-sets-`
 * prefix stripped. The pre-2026-09-21 `<vendor>-icons` spelling is not read any more
 * (forward only, 2026-11-05).
 *
 * **It is exported because it had two implementations.** `ExportService`'s
 * sprite ids repeated the same munging with a `-` separator, so the rename
 * moved `iconRef` and left the sprite behind -- four tests, one root cause.
 */
export function packShort(icon: Icon): string {
  return icon.package
    .replace(/^ichava\//, '')
    .replace(/^icon-sets-/, '');
}
