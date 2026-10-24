/**
 * TourModal — the 5-step first-run onboarding (plan Part B). Shown on first load
 * (until `tourSeen`) and replayable from Settings / the help menu.
 *
 * Laid out as Untitled UI PRO's centered-photo-carousel modal (inventory #25): a visual,
 * the centered title and body, step dots, and two equal buttons -- Skip on the first
 * step and Back after it, then Next or Get started. The steps stay store-driven rather
 * than swiped: the carousel would bring embla for five static cards, and each step's
 * copy is announced as the dialog's heading changes. The dots are decorative; the
 * position is announced as text.
 */
export declare function TourModal(): import("react").JSX.Element;
