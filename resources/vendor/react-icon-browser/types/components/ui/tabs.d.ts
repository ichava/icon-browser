/**
 * Density overrides for the Untitled UI `Tabs` (`application/tabs/tabs.tsx`, free).
 *
 * Upstream's `sm` tab is 36px with 14px type; this app's segmented tabs are 24px with
 * 11-11.5px type, inside a 2px-padded track that follows the radius slider. Applied
 * through `className`, which `cx` merges over upstream's classes, so the vendored file
 * stays untouched for `untitledui upgrade`.
 */
export declare const TAB_LIST_CLASS = "flex-wrap self-start gap-0.5 rounded-[var(--radius)] bg-transparent p-0.5";
/**
 * Square tabs, not Untitled UI's white pill in a grey track: the selected tab is a flat
 * accent tint, an unselected one takes a muted fill on hover, and a press scales it down (a tab is not a button, so the global press rule misses it).
 * The plain `bg-transparent shadow-none` replaces upstream's selected-or-hovered pill
 * (tailwind-merge drops the conflicting upstream class).
 */
export declare const TAB_CLASS = "h-6 rounded-[calc(var(--radius)_-_2px)] bg-transparent px-2 py-0 text-[11px] font-medium shadow-none [&:not([data-selected])]:hover:bg-[var(--muted)] [&:not([data-selected])]:hover:text-secondary data-[pressed]:scale-[.97] data-[selected]:bg-brand-primary_alt data-[selected]:font-semibold data-[selected]:text-brand-secondary";
