// Untitled UI React PRO, used under licence; see LICENSE
//
// The card of Untitled UI PRO's `IconNotification` (application/notifications), adapted:
//   - `NotificationCard` is the toast: featured icon, message, close. Upstream's
//     title/description pair, dismiss/confirm links and progress bar are dropped, because
//     this app's toasts are one-line confirmations queued by the store (finding A7).
//   - The close control is the design system's tertiary icon `Button` rather than
//     upstream's `CloseButton`, whose `focus:outline-hidden` cancels its own
//     `focus-visible:outline-2` ring.
//   - `NotificationRow` is the same icon-and-text pairing as a list row, for the
//     notifications popover, which lists items rather than stacking toasts.
import type { FC, ReactNode } from "react";
import { X } from "@/components/ui/chromeIcons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/lib/utils/cx";

export type NotificationColor = "brand" | "gray" | "error" | "warning" | "success";

interface NotificationCardProps {
    icon: FC<{ className?: string }>;
    color?: NotificationColor;
    children: ReactNode;
    onClose?: () => void;
    /** Accessible name of the close button. */
    closeLabel?: string;
    className?: string;
}

export const NotificationCard = ({ icon, color = "brand", children, onClose, closeLabel = "Close", className }: NotificationCardProps) => (
    <div className={cx("relative flex max-w-[360px] items-center gap-3 rounded-xl bg-primary_alt p-3 pe-11 shadow-lg ring ring-secondary_alt", className)}>
        <FeaturedIcon icon={icon} color={color} theme="outline" size="sm" />
        <p className="min-w-0 flex-1 text-sm text-fg-secondary">{children}</p>
        {onClose && (
            <Button
                color="tertiary"
                size="xs"
                iconLeading={X}
                aria-label={closeLabel}
                onClick={onClose}
                className="absolute end-2 top-1/2 -translate-y-1/2"
            />
        )}
    </div>
);

interface NotificationRowProps {
    icon: FC<{ className?: string }>;
    color?: NotificationColor;
    children: ReactNode;
    meta?: ReactNode;
    className?: string;
}

export const NotificationRow = ({ icon, color = "brand", children, meta, className }: NotificationRowProps) => (
    <div className={cx("flex gap-3 px-3 py-2.5", className)}>
        <FeaturedIcon icon={icon} color={color} theme="outline" size="sm" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-sm text-fg-secondary">{children}</p>
            {meta && <p className="text-xs text-tertiary">{meta}</p>}
        </div>
    </div>
);
