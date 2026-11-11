/**
 * ConfirmDialog — one shared confirmation modal driven by the store's `confirm`
 * slice (plan Part A). Reused by reset-filters, factory-reset, sign-out.
 *
 * Laid out as Untitled UI PRO's destructive-stacked-left-aligned modal (inventory #37):
 * a featured icon, the title as the dialog's heading, the body, and Cancel / Confirm in
 * two equal columns. The danger variant takes the error icon and a destructive button.
 */
export declare function ConfirmDialog(): import("react").JSX.Element | null;
