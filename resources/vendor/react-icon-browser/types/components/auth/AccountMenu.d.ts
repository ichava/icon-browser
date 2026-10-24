/**
 * AccountMenu — the signed-in avatar + dropdown (plan Part B). Identity is
 * `auth.user ?? config.user`; the workspace switcher + tier badges come from
 * config. Guest state renders a "Sign in" button in AppHeader instead of this.
 *
 * An Untitled UI `Dropdown` (inventory #32): a real menu, with the workspace switcher as a
 * single-selection section (`menuitemradio`, checkmark on the active one), where this was
 * a popover of buttons. The identity header sits above the menu, outside it.
 */
export declare function AccountMenu(): import("react").JSX.Element | null;
