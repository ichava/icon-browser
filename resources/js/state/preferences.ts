// The appearance and render-settings values (architecture 2.7): one home for each set of
// keys, which the store's initial state, factory reset and first-run defaults each used
// to write out by hand. The precedence rule itself is `withDefaults`, in the preferences
// domain; this file gives it the app's shipped defaults.
import { withDefaults } from '@/modules/preferences';
import { DEFAULT_APPEARANCE, DEFAULT_RENDER } from '@/core/defaults';
import { resolveTheme } from '@ichava/js-ui-kernel';
import type { AppConfig } from '@/core/config';

export type AppearanceValues = { -readonly [K in keyof typeof DEFAULT_APPEARANCE]: (typeof DEFAULT_APPEARANCE)[K] };
export type RenderValues = typeof DEFAULT_RENDER;
type Defaults = NonNullable<AppConfig['defaults']>;

/** The shipped appearance, read now: the default theme follows the system on every read. */
export function appearanceDefaults(): AppearanceValues {
  return { ...DEFAULT_APPEARANCE };
}

/** A config's appearance block over the defaults. A theme preference (`system`) is resolved. */
export function appearanceFromConfig(a: Defaults['appearance']): AppearanceValues {
  return {
    ...withDefaults<AppearanceValues>(appearanceDefaults(), { ...a, theme: undefined }),
    theme: a.theme ? resolveTheme(a.theme) : DEFAULT_APPEARANCE.theme,
  };
}

/** The shipped render settings. */
export function renderDefaults(): RenderValues {
  return { ...DEFAULT_RENDER };
}

/** A config's render block over the defaults. */
export function renderFromConfig(r: Defaults['render']): RenderValues {
  return withDefaults<RenderValues>(renderDefaults(), r);
}
