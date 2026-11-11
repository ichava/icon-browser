/** The id of the static loader a host inlines from `prepaint.html`. */
export declare const PREPAINT_ID = "ichava-prepaint";
/**
 * Take down the static prepaint loader, if the page has one.
 *
 * `immediate` removes it at once: the React bootsplash calls it that way because it paints
 * over the same spot, so a fade would show both. Otherwise it fades for 200ms first, which is
 * how the browser and the landing page hand over when there is no bootsplash in between.
 * Safe to call any number of times, and a no-op without a DOM or without a prepaint.
 */
export declare function dismissPrepaint({ immediate }?: {
    immediate?: boolean;
}): void;
