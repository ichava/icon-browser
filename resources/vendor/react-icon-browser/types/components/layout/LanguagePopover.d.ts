/**
 * LanguagePopover — a globe-triggered locale picker for the app navbar. Lists the
 * advertised locales by endonym, checks the active one, and writes `store.locale`
 * (shared with the Appearance popover's selector and persisted under `ichava.locale`).
 * The landing page (ichava/react-landingpage) has a sibling switcher over the same key.
 *
 * An Untitled UI `Dropdown` in single-selection mode (inventory #23): `menuitemradio`
 * rows with arrows, Home/End and typeahead, where the old panel declared `role="menu"`
 * over plain buttons with no keyboard model. The name keeps its export for its callers.
 */
export declare function LanguagePopover(): import("react").JSX.Element;
