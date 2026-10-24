import type { Icon } from '@ichava/js-ui-kernel';
/**
 * `ichava/icon-sets-tabler` -> `tabler`: the vendor token, with our own naming
 * stripped off either end.
 *
 * Both strips are load-bearing. Packages were `<vendor>-icons` until the
 * 2026-09-21 rebrand and are `icon-sets-<vendor>` after it, and a consumer's
 * stored data can still carry the old form, so this has to answer the same
 * short name for both spellings.
 *
 * **It is exported because it had two implementations.** `ExportService`'s
 * sprite ids repeated the same munging with a `-` separator, so the rename
 * moved `iconRef` and left the sprite behind -- four tests, one root cause.
 */
export declare function packShort(icon: Icon): string;
