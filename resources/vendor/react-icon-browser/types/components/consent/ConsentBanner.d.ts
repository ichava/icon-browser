/**
 * ConsentBanner — the "Cookies & storage" notice (plan Part B). Shown until a
 * choice is recorded (persisted). Cosmetic: there is no real tracking to gate —
 * it just records the dismissal so it doesn't reappear.
 *
 * Styled as Untitled UI PRO's dual-action banner (inventory #24), kept as a floating card
 * rather than a full-width bar so it does not cover the grid. No dismiss button: the
 * notice records a choice, and closing it without one would only bring it back.
 */
export declare function ConsentBanner(): import("react").JSX.Element;
