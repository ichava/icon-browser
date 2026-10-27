import { type SvgParts } from '../modules/svg';
import type { Icon } from '@ichava/js-ui-kernel';
/**
 * An icon's parsed SVG parts: synchronously when they are cached or inline, otherwise
 * `null` until the fetch resolves.
 *
 * One implementation for the three inline render paths in IconAsset and the palette
 * preview, which each carried their own copy of this state-and-effect pair. The state
 * is only ever set from the promise, never synchronously inside the effect, so a
 * cached icon renders on the first pass with no cascading render.
 */
export declare function useSvgParts(icon: Icon): SvgParts | null;
