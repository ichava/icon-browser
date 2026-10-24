import { DEFAULT_APPEARANCE, DEFAULT_RENDER } from '../core/defaults';
import type { AppConfig } from '../core/config';
export type AppearanceValues = {
    -readonly [K in keyof typeof DEFAULT_APPEARANCE]: (typeof DEFAULT_APPEARANCE)[K];
};
export type RenderValues = typeof DEFAULT_RENDER;
type Defaults = NonNullable<AppConfig['defaults']>;
/** The shipped appearance, read now: the default theme follows the system on every read. */
export declare function appearanceDefaults(): AppearanceValues;
/** A config's appearance block over the defaults. A theme preference (`system`) is resolved. */
export declare function appearanceFromConfig(a: Defaults['appearance']): AppearanceValues;
/** The shipped render settings. */
export declare function renderDefaults(): RenderValues;
/** A config's render block over the defaults. */
export declare function renderFromConfig(r: Defaults['render']): RenderValues;
export {};
