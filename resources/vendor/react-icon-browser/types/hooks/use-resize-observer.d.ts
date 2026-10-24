import type { RefObject } from "@react-types/shared";
/**
 * The options for the useResizeObserver hook.
 */
type useResizeObserverOptionsType<T> = {
    /**
     * The ref to the element to observe.
     */
    ref: RefObject<T | undefined | null> | undefined;
    /**
     * The box to observe.
     */
    box?: ResizeObserverBoxOptions;
    /**
     * The callback function to call when the size changes.
     */
    onResize: () => void;
};
/**
 * A hook that observes the size of an element and calls a callback function when the size changes.
 * @param options - The options for the hook.
 */
export declare function useResizeObserver<T extends Element>(options: useResizeObserverOptionsType<T>): void;
export {};
