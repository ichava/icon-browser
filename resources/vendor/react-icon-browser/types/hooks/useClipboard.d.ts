/** Copy text with a graceful fallback + a toast, so callers stay one-liners. */
export declare function useCopy(): (text: string, label?: string) => Promise<void>;
