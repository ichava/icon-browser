/**
 * Density overrides for the Untitled UI `Tabs` (`application/tabs/tabs.tsx`, free).
 *
 * Upstream's `sm` tab is 36px with 14px type; this app's segmented tabs are 24px with
 * 11-11.5px type, inside a 2px-padded track that follows the radius slider. Applied
 * through `className`, which `cx` merges over upstream's classes, so the vendored file
 * stays untouched for `untitledui upgrade`.
 */
export declare const TAB_LIST_CLASS = "flex-wrap self-start gap-0.5 rounded-[calc(var(--radius)_-_2px)] p-0.5";
export declare const TAB_CLASS = "h-6 rounded-[calc(var(--radius)_-_3px)] px-2 py-0 text-[11px] font-medium data-[selected]:font-semibold";
