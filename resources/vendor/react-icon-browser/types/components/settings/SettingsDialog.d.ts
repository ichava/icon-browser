/**
 * SettingsDialog — app behaviour and config (per page, copy format, storage, tour,
 * factory reset, and in a host app "Delete my library") and the account summary.
 *
 * Every claim about where the library is kept is true for the mode it shows in: with the
 * account (a host keeping it by user), for the session (a host keeping it by session),
 * or in this browser only (standalone, or a host with no server store). It used to say
 * favourites synced across devices everywhere, which was false in every mode.
 *
 * Header on Untitled UI PRO's modal layout with the shared close button (inventory #21);
 * the storage driver is a button group and the row actions are the design system's
 * `Button`. The row layout itself stays: PRO's settings modals are page-sized forms,
 * and this is a dense list of one-line settings.
 */
export declare function SettingsDialog(): import("react").JSX.Element;
