/**
 * CommandPalette -- the Untitled UI PRO command menu (FINDINGS B5, inventory #20).
 *
 * The view is the PRO `CommandMenu`: a react-aria Autocomplete over a sectioned ListBox,
 * so the input names the active option through `aria-activedescendant`, arrows, Home/End
 * and Enter come from react-aria, and the active row scrolls itself into view. What stays
 * here is the product logic the menu does not know about: the action list, recents
 * ranking, and searching icons as well as actions. Filtering is ours (`filter={false}`),
 * because the icon half searches names, ids and tags rather than the row label.
 */
export declare function CommandPalette(): import("react").JSX.Element;
