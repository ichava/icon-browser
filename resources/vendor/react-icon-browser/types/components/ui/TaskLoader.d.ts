/**
 * TaskLoader — the loader for work that runs longer than two seconds (Sim, 2026-10-27).
 *
 * The page loader is the bootsplash; this is its small sibling for everything after: an
 * export, rendering a PNG, selecting every match over the API. Same mark and bar as the
 * splash, so the app has one loading language. It renders the store's task list, which
 * only holds work that has outlived `TASK_LOADER_DELAY_MS`, so a quick task never flashes
 * it. Polite live region: announced once, never interrupting.
 */
export declare function TaskLoader(): import("react").JSX.Element | null;
/**
 * The task loader's look on its own, driven by props, so a host page (the ichava.com site)
 * can show the same loader for its own slow work without the browser's store.
 */
export declare function TaskLoaderView({ label, more }: {
    label: string;
    more?: number;
}): import("react").JSX.Element;
