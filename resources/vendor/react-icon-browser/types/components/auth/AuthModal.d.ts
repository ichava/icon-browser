/**
 * AuthModal — the frontend DEMO auth flow (plan Part B): sign-in via a one-time
 * code (email → 6-digit OTP; "any code signs in", 000000 = failure) and a
 * create-account variant. Purely client-side; no backend. All flow/timer state is
 * local — the store only holds the resulting `auth`.
 *
 * Laid out on Untitled UI PRO's login and signup modals (inventory #31): centered brand
 * mark, the title as the dialog's heading, the form, and a stacked footer with the
 * primary action. The Cancel link is gone: the shared close button and Escape close it.
 */
export declare function AuthModal(): import("react").JSX.Element | null;
