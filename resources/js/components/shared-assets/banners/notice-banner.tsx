// Untitled UI React PRO, used under licence; see LICENSE
//
// The card of Untitled UI PRO's `banner-dual-action-default` (shared-assets/banners),
// with its copy and buttons as props. Upstream is a demo with fixed cookie copy and a
// dismiss button; the app supplies translated copy and its own actions.
import type { FC, HTMLAttributes, ReactNode, Ref } from "react";
import { useId } from "react";
import { cx } from "@ichava/js-ui-kernel/react";

interface NoticeBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    icon?: FC<{ className?: string }>;
    title: ReactNode;
    body?: ReactNode;
    /** The action buttons, right-aligned under the copy. */
    actions: ReactNode;
    /** Rendered first in the card, before the copy: a drag handle, say. */
    handle?: ReactNode;
    ref?: Ref<HTMLDivElement>;
}

export const NoticeBanner = ({ icon: Icon, title, body, actions, handle, className, ...props }: NoticeBannerProps) => {
    const bodyId = useId();
    return (
        <div
            aria-describedby={body ? bodyId : undefined}
            {...props}
            className={cx("flex flex-col gap-4 rounded-xl bg-secondary p-4 text-start shadow-lg ring-1 ring-secondary_alt", className)}
        >
            {handle}
            <div className="flex gap-3">
                {Icon && <Icon aria-hidden className="size-5 shrink-0 text-fg-brand-primary_alt" />}
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-secondary">{title}</p>
                    {body && (
                        <p id={bodyId} className="text-sm text-tertiary">
                            {body}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex justify-end gap-3">{actions}</div>
        </div>
    );
};
