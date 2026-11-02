import type { ReactNode } from "react";
interface ModalHeaderProps {
    /** A logo, avatar or featured icon above (centered) or beside the title. */
    icon?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    /** `center` is the login/signup layout; `start` is profile-settings'. */
    align?: "center" | "start";
    className?: string;
}
/** Title block. The title is the dialog's `slot="title"` heading. */
export declare const ModalHeader: ({ icon, title, description, align, className }: ModalHeaderProps) => import("react").JSX.Element;
/** The form or content area, with upstream's 20px gap under the header. */
export declare const ModalBody: ({ children, className }: {
    children: ReactNode;
    className?: string;
}) => import("react").JSX.Element;
interface ModalFooterProps {
    children: ReactNode;
    /**
     * `stack` is the login/signup column of full-width buttons; `row` is profile-settings'
     * right-aligned row; `grid` is the destructive confirmation's two equal columns.
     */
    layout?: "stack" | "row" | "grid";
    className?: string;
}
export declare const ModalFooter: ({ children, layout, className }: ModalFooterProps) => import("react").JSX.Element;
export {};
