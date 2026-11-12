// Untitled UI React PRO, used under licence; see LICENSE
//
// The header, body and footer of Untitled UI PRO's modal blocks, factored out of
// `login-modal`, `signup-01-modal`, `profile-settings-modal`, `email-invite-modal`,
// `share-project-modal` and `destructive-stacked-left-aligned-modal` (application/modals).
// Upstream ships those as finished demos with hard-coded copy and their own open state;
// this app already owns the overlay (`ui/Modal`) and its copy (seven locales), so what is
// taken is their layout: the paddings, the title/description pair with the title as the
// dialog's `slot="title"` heading, the stacked or right-aligned action row.
import type { ReactNode } from "react";
import { Heading as AriaHeading } from "react-aria-components";
import { cx } from "@/lib/utils/cx";

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
export const ModalHeader = ({ icon, title, description, align = "start", className }: ModalHeaderProps) => (
    <div className={cx("flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6", align === "center" && "items-center text-center", className)}>
        {icon}
        <div className={cx("flex flex-col gap-0.5", align === "center" && "items-center")}>
            <AriaHeading slot="title" className="text-md font-semibold text-primary">
                {title}
            </AriaHeading>
            {description && <div className="text-sm text-tertiary">{description}</div>}
        </div>
    </div>
);

/** The form or content area, with upstream's 20px gap under the header. */
export const ModalBody = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cx("flex flex-col gap-4 px-4 pt-5 sm:px-6", className)}>{children}</div>
);

interface ModalFooterProps {
    children: ReactNode;
    /**
     * `stack` is the login/signup column of full-width buttons; `row` is profile-settings'
     * right-aligned row; `grid` is the destructive confirmation's two equal columns.
     */
    layout?: "stack" | "row" | "grid";
    className?: string;
}

export const ModalFooter = ({ children, layout = "stack", className }: ModalFooterProps) => (
    <div
        className={cx(
            "flex gap-3 p-4 pt-6 sm:px-6 sm:pt-8 sm:pb-6",
            layout === "stack" && "flex-col *:grow",
            layout === "row" && "flex-col-reverse sm:flex-row sm:items-center sm:justify-end",
            layout === "grid" && "flex-col-reverse *:grow sm:grid sm:grid-cols-2",
            className,
        )}
    >
        {children}
    </div>
);
