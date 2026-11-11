/**
 * Toaster — renders the store's toast queue.
 *
 * Replaces `sonner`. The reason is not the library: it is that `store.ts` imported
 * `toast` from it and called into a UI at the point of a state change, which is finding
 * A7 -- the state layer knowing about presentation. The store now owns a queue and this
 * component owns how a toast looks, which also means a host embedding the browser can
 * render the queue its own way, and tests can assert on it without a DOM.
 *
 * `aria-live="polite"` on the region rather than a role per toast: a screen reader
 * announces new children as they arrive without stealing focus, which is what a transient
 * confirmation wants. `role="alert"` would interrupt.
 *
 * Each toast is Untitled UI PRO's notification card (inventory #27): a featured icon
 * coloured by the toast's glyph, the message, and a named close button. Toasts used to
 * be whole-card buttons, so the message itself was announced as a button.
 */
export declare function Toaster(): import("react").JSX.Element | null;
