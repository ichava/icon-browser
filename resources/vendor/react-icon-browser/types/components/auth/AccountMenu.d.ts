/**
 * AccountMenu — the signed-in avatar + dropdown (plan Part B). Identity is
 * `auth.user ?? config.user` (`useAccount`); inside a host app that is the host's user,
 * with its avatar, and sign-out goes to the host's logout route. The workspace switcher,
 * tier badge and shared collections are demo modules: shown only where the features
 * manifest (or, standalone, the config) turns them on. Guest state renders a "Sign in"
 * button in AppHeader instead of this.
 *
 * An Untitled UI `Dropdown` (inventory #32): a real menu, with the workspace switcher as a
 * single-selection section (`menuitemradio`, checkmark on the active one), where this was
 * a popover of buttons. The identity header sits above the menu, outside it.
 */
export declare function AccountMenu(): import("react").JSX.Element | null;
