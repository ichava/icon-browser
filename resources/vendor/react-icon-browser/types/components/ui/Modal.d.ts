import type { CSSProperties, ReactNode } from 'react';
/**
 * Modal — overlay + centred panel, on Untitled UI.
 *
 * The public API (`onClose`/`width`/`align`/`panelStyle`/`label`) is unchanged, so all
 * sixteen dialog components are untouched by the swap.
 *
 * This was Radix Dialog, and mixing it with react-aria overlays was a real bug, not just
 * an inconsistency. **Radix sets `pointer-events: none` on the body while a dialog is
 * open** and re-enables it only inside the dialog subtree. Every react-aria popover --
 * every migrated Select, the motion combo box -- portals to `<body>`, i.e. outside that
 * subtree, so its options rendered, were visible, and could not be clicked. Playwright's
 * account was literally `<html> intercepts pointer events`. Selects inside modals were
 * unusable, which is what the dropdowns-don't-work reports were describing.
 *
 * On one overlay system the stacking and pointer-events agree, and the fix is structural
 * rather than a z-index that happens to win today.
 *
 * The border is gone too. The old panel carried `border-[var(--border)]` over `--pop`, which read
 * as a hard dark outline in dark mode and did not match any other surface. Untitled UI
 * separates a modal from the page with elevation -- `shadow-xl` over a dimmed, blurred
 * overlay -- which is the design system's own answer and needs no border.
 */
export declare function Modal({ onClose, children, width, align, panelStyle, label, showClose, closeLabel, }: {
    onClose: () => void;
    children: ReactNode;
    width: number;
    align?: 'center' | 'top';
    panelStyle?: CSSProperties;
    label?: string;
    /**
     * Render the shared close button. Defaults to true, so a dialog gets one by simply
     * existing rather than by remembering to add one -- five of them had no close
     * affordance at all beyond Escape, which is invisible to a pointer user.
     *
     * Set false only where the dialog already draws its own in a header row.
     */
    showClose?: boolean;
    closeLabel?: string;
}): import("react").JSX.Element;
