/**
 * ConsentBanner — the "Cookies & storage" notice (plan Part B). Shown until a
 * choice is recorded (persisted). Cosmetic: there is no real tracking to gate —
 * it just records the dismissal so it doesn't reappear.
 *
 * Styled as Untitled UI PRO's dual-action banner (inventory #24), kept as a floating card
 * rather than a full-width bar so it does not cover the grid. No dismiss button: the
 * notice records a choice, and closing it without one would only bring it back.
 *
 * Movable, because a notice that cannot be dismissed must at least get out of the way of
 * whatever it covers: drag the grip at its top (mouse, pen or touch), or focus the grip and
 * use the arrow keys (Shift for bigger steps, Home to put it back). It stays inside the
 * window, and remembers where it was put for the session. The grip is the first thing in
 * the card, so the tab order is grip, "Essential only", "Accept all".
 */
export declare function ConsentBanner(): import("react").JSX.Element;
